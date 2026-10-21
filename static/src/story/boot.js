import { whenReady } from "@odoo/owl";
import { assets } from "@web/core/assets";
import { mountComponent } from "@web/env";
import { installImageInterceptor } from "../mock_server/image_interceptor";
import { installRpcInterceptor } from "../mock_server/rpc_interceptor";

/**
 * Bundles the web client loads lazily but that Owlybook ships in its own
 * bundle, so that exported stories, which can't load anything, have them.
 */
const SHIPPED_BUNDLES = new Set([
    "web.assets_backend_lazy",
    "web.assets_backend_lazy_dark",
    "web.chartjs_lib",
]);

/** How the page runs, read by the components that depend on it. */
export const owlybookMode = {
    /** No Odoo server behind the page: an exported story or site. */
    offline: false,
};

/**
 * Starts Owlybook, or an exported story, with `Root` as root component.
 *
 * @param {typeof import("@odoo/owl").Component} Root
 * @param {Object} [options]
 * @param {boolean} [options.offline] no Odoo server behind the page
 * @param {string[]} [options.shippedBundles] more bundles the page ships
 */
export async function startOwlybook(Root, { offline = false, shippedBundles = [] } = {}) {
    owlybookMode.offline = offline;
    installRpcInterceptor({ offline });
    const shipped = new Set([...SHIPPED_BUNDLES, ...shippedBundles]);
    const loadBundle = assets.loadBundle;
    assets.loadBundle = function (bundleName, options) {
        if (shipped.has(bundleName)) {
            return Promise.resolve();
        }
        return loadBundle.call(this, bundleName, options);
    };
    await whenReady();
    installImageInterceptor();
    document.body.classList.add("o_web_client");
    // Dev mode: Owl validates the props, so a story shows wrong props.
    return mountComponent(Root, document.body, { name: "Owlybook", dev: true });
}
