/** @odoo-module */

import { Sidebar } from "./sidebar/sidebar";
import { Canvas } from "./canvas/canvas";
import { Panel } from "./bottom_panel/panel";
import { Component, onMounted } from "@odoo/owl";
import { setupStories } from "./stories";
import { registry } from "@web/core/registry";
import { useBus } from "@web/core/utils/hooks";
import { MainComponentsContainer } from "@web/core/main_components_container";
import { router, routerBus } from "@web/core/browser/router";

export class OwlybookView extends Component {
    static template = "owlybook.OwlybookView";
    static components = { Sidebar, Canvas, Panel, MainComponentsContainer };

    setup() {
        this.stories = setupStories(router);
        onMounted(this.onMounted);
        useBus(routerBus, "ROUTE_CHANGE", this.setStoryFromUrl);
        this.hideSidebar = router.current?.hideSidebar;
    }

    onMounted() {
        this.setStoryFromUrl();
    }

    setStoryFromUrl() {
        const state = router.current || {};
        if (state.title && state.folder && state.module) {
            this.stories.setActive(this.stories.getStoryByDescription(state));
        }
    }
}

registry.category("actions").add("owlybook_view", OwlybookView);
