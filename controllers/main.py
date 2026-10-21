import base64
import gzip
import json
import mimetypes
import re

from odoo import http
from odoo.http import request
from odoo.tools import file_path
from odoo.tools.json import json_default, scriptsafe

STANDALONE_BUNDLE = "owlybook.assets_standalone"
SITE_BUNDLE = "owlybook.assets_site"

# Only what the web client needs to boot. The real session describes the user
# who exports the story, and the exported file is meant to be shared.
SESSION_KEYS = (
    "currencies",
    "max_file_upload_size",
    "server_version",
    "server_version_info",
    "view_info",
)

CSS_URL_RE = re.compile(r"""url\((['"]?)(/[^'")?#]+)[^'")]*\1\)""")
FONT_FACE_RE = re.compile(r"@font-face\s*\{[^}]*\}")
FONT_SRC_RE = re.compile(r"src:[^;}]*;?")
WOFF2_URL_RE = re.compile(r"""url\((['"]?)[^'")]+\.woff2[^'")]*\1\)""")


def _compress(text):
    """Gzip then base64: what the exported page inflates when it loads."""
    return base64.b64encode(gzip.compress(text.encode(), 9)).decode()


def _json_for_script(value):
    """Serialize ``value`` so it can sit inside a <script> element."""
    return scriptsafe.dumps(value, default=json_default)


class Owlybook(http.Controller):

    @http.route("/owlybook", type="http", auth="user", readonly=True)
    def owlybook(self, **kwargs):
        return request.render("owlybook.owlybook_page", {
            "session_info": {
                **request.env["ir.http"].session_info(),
                "owlybook_addons": self._get_shown_addons(),
            },
        })

    def _get_shown_addons(self):
        """The addons whose stories are shown, from the `owlybook.addons`
        system parameter: comma separated, `*` as wildcard (`web,hr,hr_*`).
        Empty: every addon."""
        value = request.env["ir.config_parameter"].sudo().get_str("owlybook.addons") or ""
        return [addon.strip() for addon in value.split(",") if addon.strip()]

    # Not readonly: the first export compiles the bundles of the page and of
    # the fonts, which are saved as attachments.
    @http.route("/owlybook/export", type="http", auth="user", methods=["POST"])
    def export_story(self, story, state="{}", filename="story", **kwargs):
        """Return the given story as a single HTML file that works offline."""
        return self._export_page(
            STANDALONE_BUNDLE,
            title=filename,
            filename=filename,
            story={"id": story, "state": json.loads(state)},
        )

    @http.route("/owlybook/export_site", type="http", auth="user", methods=["POST"])
    def export_site(self, **kwargs):
        """Return the whole Owlybook as a single HTML file that works offline,
        to publish as a static site (it can be served as index.html)."""
        return self._export_page(SITE_BUNDLE, title="Owlybook", filename="index")

    def _export_page(self, bundle_name, title, filename, story=None):
        """Build a page running the given bundle without any server.

        The compiled assets, the fonts and images they reference, the session
        and the translations are inlined. The assets are compressed (gzip, then
        base64), the page inflates them when it loads: the file is about four
        times smaller.
        """
        bundle = request.env["ir.qweb"]._get_asset_bundle(bundle_name, debug_assets=False)
        css = "\n".join(attachment.raw.decode() for attachment in bundle.css())
        js = bundle.js().raw.decode()
        html = request.env["ir.qweb"]._render("owlybook.owlybook_standalone_page", {
            "title": title,
            "css": _compress(self._inline_css_urls(css)),
            "js": _compress(js),
            "session_info": _json_for_script(self._get_standalone_session_info()),
            "translations": _json_for_script(self._get_translations()),
            "story": story and _json_for_script(story),
        })
        safe_name = re.sub(r"[^\w.-]+", "_", filename).strip("_") or "story"
        return request.make_response(html, [
            ("Content-Type", "text/html; charset=utf-8"),
            ("Content-Disposition", f'attachment; filename="{safe_name}.html"'),
        ])

    def _get_standalone_session_info(self):
        session_info = request.env["ir.http"].session_info()
        lang = session_info["user_context"].get("lang", "en_US")
        return {
            **{key: session_info[key] for key in SESSION_KEYS if key in session_info},
            "uid": 2,
            "name": "Mitchell Admin",
            "username": "admin",
            "partner_id": 3,
            "partner_display_name": "Mitchell Admin",
            "is_admin": True,
            "is_system": True,
            "is_internal_user": True,
            "is_public": False,
            "db": "owlybook",
            "registry_hash": "owlybook",
            "user_context": {"lang": lang, "tz": "UTC"},
            "user_settings": {"id": 1},
            "owlybook_addons": self._get_shown_addons(),
            "bundle_params": {"lang": lang},
            "test_mode": False,
        }

    def _get_translations(self):
        ir_http = request.env["ir.http"]
        modules = ir_http._get_web_translations_modules()
        lang = ir_http._get_web_translations_lang(None)
        translations, lang_params = ir_http._get_translations_for_webclient(modules, lang)
        return {
            "lang": lang,
            "hash": "owlybook",
            "lang_parameters": lang_params,
            "modules": translations,
            "multi_lang": False,
        }

    def _inline_css_urls(self, css):
        """Replace the server urls of a stylesheet by data urls.

        Fonts come in several formats and every browser that can run Owl reads
        woff2, so the other formats are dropped before inlining to keep the
        exported file small.
        """
        def keep_woff2_only(match):
            font_face = match.group(0)
            woff2 = WOFF2_URL_RE.search(font_face)
            if not woff2:
                return font_face
            font_face = FONT_SRC_RE.sub("", font_face)
            return f'{font_face[:-1]};src:{woff2.group(0)} format("woff2")}}'

        cache = {}

        def to_data_url(match):
            url = match.group(2)
            if url not in cache:
                cache[url] = self._read_static_file_as_data_url(url)
            return f'url("{cache[url]}")' if cache[url] else match.group(0)

        css = FONT_FACE_RE.sub(keep_woff2_only, css)
        return CSS_URL_RE.sub(to_data_url, css)

    def _read_static_file_as_data_url(self, url):
        """Data url of a static file (/web/static/...) or of a compiled asset
        (/web/assets/..., the icon fonts), None when it can't be found."""
        content = None
        if url.startswith("/web/assets/"):
            filename = url.rsplit("/", 1)[1]
            try:
                bundle_name, _rtl, asset_type, _autoprefix = request.env["ir.asset"]._parse_bundle_name(filename, False)
            except ValueError:
                return None
            if asset_type != "binary":
                return None
            bundle = request.env["ir.qweb"]._get_asset_bundle(bundle_name, css=False, js=False, binary=True)
            content = bundle.bin(filename.rsplit(".", 1)[1]).raw
        else:
            parts = url.lstrip("/").split("/")
            if len(parts) >= 3 and parts[1] == "static":
                try:
                    with open(file_path("/".join(parts)), "rb") as file:
                        content = file.read()
                except (FileNotFoundError, ValueError):
                    content = None
        if not content:
            return None
        mimetype = mimetypes.guess_type(url)[0] or "application/octet-stream"
        return f"data:{mimetype};base64,{base64.b64encode(content).decode()}"
