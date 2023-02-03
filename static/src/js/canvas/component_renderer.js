/** @odoo-module */

import { Component, xml } from "@odoo/owl";
import { useStories } from "../stories";

export class ComponentRenderer extends Component {
    static template = xml`
        <t t-if="stories.active.component">
            <t t-component="stories.active.component" t-props="storyProps" t-key="propsKey"/>
        </t>
    `;

    setup() {
        this.stories = useStories();
    }

    get storyProps() {
        const finalProps = {};
        for (const [propName, config] of Object.entries(this.stories.active.processedProps)) {
            finalProps[propName] = config.value;
        }
        return finalProps;
    }

    get propsKey() {
        return JSON.stringify(this.storyProps);
    }
}
