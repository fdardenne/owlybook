import base64
import gzip
import json
import re

from odoo.tests import HttpCase, tagged

# Renders every story, one after the other, and fails with the list of the
# stories that could not be rendered.
RENDER_ALL_STORIES = """
(async () => {
    // Generated stories are added when the app starts.
    while (!document.querySelector(".o_owlybook_sidebar")) {
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
    const { stories } = odoo.loader.modules.get("@owlybook/story/story_registry");
    if (stories.getAll().length < 50) {
        console.error(`Only ${stories.getAll().length} stories: the widget stories are missing`);
        return;
    }
    const failures = [];
    // Generated stories of other addons are best effort: some widgets need
    // options or a context only a written story can give.
    const toCheck = stories.getAll().filter((story) => !story.generated || story.addon === "web");
    for (const story of toCheck) {
        location.hash = "story=" + story.id;
        let preview;
        for (let i = 0; i < 50 && !preview; i++) {
            await new Promise((resolve) => setTimeout(resolve, 50));
            preview = document.querySelector(".o_owlybook_preview");
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
        const error = document.querySelector(".o_owlybook_preview_error p");
        if (!preview || error) {
            failures.push(`${story.id}: ${error ? error.innerText : "not rendered"}`);
        }
    }
    // The calls made after switching stories go to the mock server of the
    // story shown, never to the Odoo server where its models don't exist.
    const { rpc } = odoo.loader.modules.get("@web/core/network/rpc");
    for (const storyId of ["web/fields/char", "web/form/sales-order", "web/fields/char"]) {
        location.hash = "story=" + storyId;
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    try {
        await rpc("/web/dataset/call_kw/story.record/search_count", {
            model: "story.record",
            method: "search_count",
            args: [[]],
            kwargs: {},
        });
    } catch (error) {
        failures.push(`after switching stories, a call reached the server: ${error.message}`);
    }
    if (failures.length) {
        console.error("Stories failed to render:\\n" + failures.join("\\n"));
    } else {
        console.log("test successful");
    }
})();
"""

# Replaces a blank page by the exported one, then checks the story renders
# without loading anything: every resource must come from a data url. (The
# test browser refuses file:// urls, and about:blank isn't a secure context.)
CHECK_EXPORTED_STORY = """
(async () => {
    performance.clearResourceTimings();
    document.open();
    document.write(EXPORTED_HTML);
    document.close();
    for (let i = 0; i < 100; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const error = document.querySelector(".o_owlybook_preview_error");
        if (error) {
            console.error("The exported story failed: " + error.innerText);
            return;
        }
        if (document.querySelector(".o_owlybook_preview .o_form_view .o_statusbar_status")) {
            const loaded = performance
                .getEntriesByType("resource")
                .map((entry) => entry.name)
                .filter((url) => !url.startsWith("data:"));
            if (loaded.length) {
                console.error("The exported story loaded: " + loaded.join(", "));
            } else {
                console.log("test successful");
            }
            return;
        }
    }
    console.error("The exported story was not rendered");
})();
"""


CHECK_EXPORTED_SITE = """
(async () => {
    performance.clearResourceTimings();
    document.open();
    document.write(EXPORTED_HTML);
    document.close();
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let i = 0; i < 100 && !document.querySelector(".o_owlybook_sidebar"); i++) {
        await sleep(100);
    }
    location.hash = "story=web/form/sales-order";
    for (let i = 0; i < 100 && !document.querySelector(".o_owlybook_preview .o_form_view"); i++) {
        await sleep(100);
    }
    const loaded = performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((url) => !url.startsWith("data:") && !url.startsWith("blob:"));
    if (!document.querySelector(".o_owlybook_preview .o_form_view")) {
        console.error("The exported site doesn't render the story");
    } else if (loaded.length) {
        console.error("The exported site loaded: " + loaded.join(", "));
    } else {
        console.log("test successful");
    }
})();
"""


def _inflate(html, element_id):
    """The content of a compressed script of an exported page."""
    payload = re.search(rf'<script[^>]*id="{element_id}"[^>]*>([^<]*)</script>', html).group(1)
    return gzip.decompress(base64.b64decode(payload)).decode()


@tagged("post_install", "-at_install")
class TestOwlybook(HttpCase):

    def test_every_story_renders(self):
        self.browser_js(
            "/owlybook", RENDER_ALL_STORIES, login="admin", timeout=600,
            success_signal="test successful",
        )

    def _export(self, story, state):
        self.authenticate("admin", "admin")
        return self.url_open("/owlybook/export", data={
            "csrf_token": self.csrf_token(),
            "story": story,
            "state": json.dumps(state),
            "filename": "Sales order",
        })

    def test_export_is_standalone(self):
        response = self._export("web/form/sales-order", {"withControls": True})
        self.assertEqual(response.status_code, 200)
        self.assertIn('filename="Sales_order.html"', response.headers["Content-Disposition"])
        html = response.text
        self.assertNotRegex(html, r"<script[^>]+src=", "scripts must be inlined")
        self.assertNotRegex(html, r"<link[^>]+href=\"(?!data:)", "stylesheets must be inlined")
        # Fonts and images of the stylesheets are inlined as data urls.
        style = _inflate(html, "owlybook_css")
        self.assertIn("odoo.define(", _inflate(html, "owlybook_js"))
        self.assertNotRegex(style, r"""url\(["']?/web/assets/""")
        self.assertIn("data:font/woff2;base64,", style)
        # The session of the exporting user doesn't leak into the file.
        self.assertNotIn(self.env.cr.dbname, html)

    def test_exported_site_works_offline(self):
        self.authenticate("admin", "admin")
        response = self.url_open("/owlybook/export_site", data={"csrf_token": self.csrf_token()})
        self.assertEqual(response.status_code, 200)
        self.assertIn('filename="index.html"', response.headers["Content-Disposition"])
        code = CHECK_EXPORTED_SITE.replace("EXPORTED_HTML", json.dumps(response.text))
        self.browser_js("/owlybook/static/tests/blank.html", code, timeout=120)

    def test_exported_story_works_offline(self):
        response = self._export("web/form/sales-order", {"withControls": False})
        code = CHECK_EXPORTED_STORY.replace("EXPORTED_HTML", json.dumps(response.text))
        self.browser_js("/owlybook/static/tests/blank.html", code, timeout=120)
