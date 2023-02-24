/* @odoo-module */

import { Sidebar } from "./sidebar/sidebar";
import { Canvas } from "./canvas/canvas";
import { Panel } from "./bottom_panel/panel";
import { Component, onMounted } from "@odoo/owl";
import { setupStories } from "./stories";
import { registry } from "@web/core/registry";

export class UIPlaygroundView extends Component {
    setup() {
        this.stories = setupStories();
        this.setStoryFromUrl();
        onMounted(this.onMounted);
    }

    onMounted() {
        window.addEventListener("hashchange", (ev) => {
            this.setStoryFromUrl();
        });
    }

    setStoryFromUrl() {
        const hash = window.location.hash;
        if (hash !== "") {
            const params = this.stories.parseParams(hash.slice(1));
            this.stories.setActive(this.stories.getStoryByName(params));
        }
    }
}

UIPlaygroundView.template = "ui_playground.UiPlaygroundView";
UIPlaygroundView.components = { Sidebar, Canvas, Panel };

registry.category("actions").add("ui_playground_view", UIPlaygroundView);
