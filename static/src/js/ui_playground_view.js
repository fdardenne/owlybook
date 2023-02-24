/* @odoo-module */

import { Sidebar } from "./sidebar/sidebar";
import { Canvas } from "./canvas/canvas";
import { Panel } from "./bottom_panel/panel";
import { Component , onMounted , useEffect} from "@odoo/owl";
import { setupStories } from "./stories";
import { registry } from "@web/core/registry";

export class UIPlaygroundView extends Component {
    setup() {
        this.stories = setupStories();
        this.getUrl();
        onMounted(this.onMounted);
    }

    onMounted() {
        window.addEventListener("hashchange", (ev) => {
            this.getUrl();
        });
    }

    getUrl() {
        const url = document.URL;
        const params = this.stories.parseParams(url.substring(url.indexOf("#") + 1, url.length));
        if (!("introduction" in params)) {
            this.stories.setActive(this.stories.getStoryByName(params));
        } else {
            this.stories.resetActive();
        }
    }
}

UIPlaygroundView.template = "ui_playground.UiPlaygroundView";
UIPlaygroundView.components = { Sidebar, Canvas, Panel };

registry.category("actions").add("ui_playground_view", UIPlaygroundView);
