/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useStories } from "../../stories";
import { ObjectRenderer } from "../../components/object_renderer/object_renderer";
import { SelectMenu } from "@web/core/select_menu/select_menu";

export class ComponentProperties extends Component {
    static template = "owlybook.properties";
    static components = { ObjectRenderer, SelectMenu };

    setup() {
        this.stories = useStories();
    }

    /**
     * The goal of this function is get the property type of the component for each props
     * @param props
     * @returns {*|string}
     */
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

    /**
     * The goal of this function is to get the processed props of the active stories, if there is not return empty dic
     * @returns {*|{}}
     */
    get properties() {
        return this.stories.active?.processedProps || {};
    }

    /**
     * The goal of this function is know if a props is readonly
     * @param prop
     * @returns {*}
     */
    isDisabled(prop) {
        return prop.readonly;
    }

    /**
     * The goal of this function is to change the value of a props
     * @param props
     * @param value
     */
    onChange(props, value) {
        props.value = value;
    }

    /**
     * The goal of this function is simply to return the value
     * @param type
     * @param value
     * @returns {*}
     */
    formatValue(type, value) {
        return value;
    }

    /**
     * The goal of this function is to get events of the active stories, if there is not return empty dic
     * @returns {*|{}}
     */
    get storyEvents() {
        return this.stories.active?.events || {};
    }
}
