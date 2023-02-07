/** @odoo-module **/

import { Component } from "@odoo/owl";
import { ComponentRenderer } from "./component_renderer";
import { ArchRenderer } from "./arch_renderer";
import { useStories } from "../stories";

export class Canvas extends Component {
    static components = { ComponentRenderer, ArchRenderer };
    static template = "ui_playground.canvas";

    setup() {
        this.stories = useStories();
    }
}
