/* @odoo-module */

import { Sidebar } from "./sidebar/sidebar";
import { Canvas } from "./canvas/canvas";
import { Panel } from "./bottom_panel/panel";
import { Component, onMounted } from "@odoo/owl";
import { setupStories } from "./stories";
import { registry } from "@web/core/registry";
import { useBus, useService } from "@web/core/utils/hooks";
import { MainComponentsContainer } from "@web/core/main_components_container";

export class UIPlaygroundView extends Component {
    setup() {
        this.router = useService("router");
        this.stories = setupStories(this.router);
        onMounted(this.onMounted);
        useBus(this.env.bus, "ROUTE_CHANGE", this.setStoryFromUrl);
    }

    onMounted() {
        this.setStoryFromUrl();
    }

    setStoryFromUrl() {
        const hash = this.router.current.hash;
        if (hash.title && hash.folder && hash.module) {
            this.stories.setActive(this.stories.getStoryByDescription(hash));
        }
    }
}

UIPlaygroundView.template = "ui_playground.UiPlaygroundView";
UIPlaygroundView.components = { Sidebar, Canvas, Panel, MainComponentsContainer };

registry.category("actions").add("ui_playground_view", UIPlaygroundView);
