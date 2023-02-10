/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useStories } from "../../stories";

export class Props extends Component {
    static template = "ui_playground.properties";

    setup() {
        this.stories = useStories();
    }

    propertyType(props) {
        const str = props?.type?.name || typeof props.value;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    get properties() {
        return this.stories.active?.processedProps || {};
    }

    isDisabled(prop) {
        return !prop.dynamic;
    }

    onChange(props, value) {
        props.value = value;
    }

    formatValue(type, value) {
        return value;
    }
}
