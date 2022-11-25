/* @odoo-module */

import { Sidebar } from "./sidebar/sidebar";
import { Canvas } from "./canvas/canvas";
import { Component } from "@odoo/owl";
import { setupStories } from "./stories";
import { registry } from "@web/core/registry";
export class StorybookView extends Component {
    setup() {
        this.stories = setupStories();
    }
}

StorybookView.template = "storybook.StorybookView";
StorybookView.components = { Sidebar, Canvas };

registry.category("actions").add("storybook_view", StorybookView);
