/** @odoo-module */

import { Component, xml } from "@odoo/owl";
import { useStories } from "../stories";

export class ComponentRenderer extends Component {
    static template = xml`
        <t t-if="stories.active.component">
            <t t-component="stories.active.component"/>
        </t>
    `;

    setup() {
        this.stories = useStories();
    }
}
