/* @odoo-module */

import { Sidebar } from "./sidebar/sidebar";
import { Canvas } from "./canvas/canvas";
import { Panel } from "./panel/panel";
import { Component } from "@odoo/owl";
import { setupStories } from "./stories";
import { registry } from "@web/core/registry";
export class UIPlaygroundView extends Component {
    setup() {
        this.stories = setupStories();
    }
}

UIPlaygroundView.template = "ui_playground.UiPlaygroundView";
UIPlaygroundView.components = { Sidebar, Canvas, Panel };

registry.category("actions").add("ui_playground_view", UIPlaygroundView);
