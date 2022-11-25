/** @odoo-module */

import { CheckBox } from "@web/core/checkbox/checkbox";

import { Component, xml } from "@odoo/owl";
import storyParam from "./sample.stories";

export class ComponentRenderer extends Component {
    static template = xml`<CheckBox/> `;
    static components = { CheckBox };
    setup() {
        this.storyParam = storyParam;
    }
}
