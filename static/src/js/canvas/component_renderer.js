/** @odoo-module */

import { Component, xml } from "@odoo/owl";
import { useStories } from "../stories";

export class ComponentRenderer extends Component {
    static template = xml`
        <t t-if="stories.active.component">
            <t t-component="stories.active.parentComponent" storyProps="storyProps" changeProps.bind="changeProps"/>
        </t>
    `;

    setup() {
        this.stories = useStories();
    }

    /**
     * The goal of this function is to get the final props of a story
     * @returns {Object}
     */
    get storyProps() {
        const finalProps = {};
        for (const [propName, config] of Object.entries(this.stories.active.processedProps)) {
            finalProps[propName] = config.value;
        }
        return finalProps;
    }

    /**
     * The goal of this function is to change the value of a specific props in the current active story
     * @param name
     * @param value
     */
    changeProps(name, value) {
        this.stories.active.processedProps[name].value = value;
    }

    /**
     * The goal of this function is to stingify the props of a story
     * @returns {string}
     */
    get propsKey() {
        return JSON.stringify(this.storyProps);
    }
}
