/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useStories } from "../../stories";
import { ObjectRenderer } from "../../components/object_renderer/object_renderer";
export class Props extends Component {
    static template = "ui_playground.properties";
    static components = { ObjectRenderer };

    setup() {
        this.stories = useStories();
    }

    propertyType(props) {
        const propsValidationType = props?.type?.name;

        if (propsValidationType) {
            return props.type.name;
        }
        if (Array.isArray(props.value)) {
            return "Array";
        }
        const str = typeof props.value;
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

    get storyEvents() {
        return this.stories.active?.events || {};
    }
}
