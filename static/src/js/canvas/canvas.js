/** @odoo-module **/

import { Component } from "@odoo/owl";
import { ComponentRenderer } from "./component_renderer";
import { useStories } from "../stories";

export class Canvas extends Component {
    static components = { ComponentRenderer };
    static template = "storybook.canvas";

    setup() {
        this.stories = useStories();
    }
}
