/** @odoo-module **/

import { Component } from "@odoo/owl";
import { ComponentRenderer } from "./component_renderer";
import { useStories } from "../stories";

export class Canvas extends Component {
    static template = "storybook.canvas";
    static components = { ComponentRenderer };

    setup() {
        this.stories = useStories();
    }
}
