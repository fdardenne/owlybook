/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useStories } from "../../stories";

export class Props extends Component {
    static template = "ui_playground.props";

    setup() {
        this.stories = useStories();
    }

    propsType(props) {
        const str = props?.type?.name || typeof props.value;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    get storyProps() {
        return this.stories.active?.processedProps || {};
    }

    /**
     * This function allow to display the value of the help entrie of each props in the tooltip
     * @returns {string} - The value to be displayed
     */
    get tooltipInfo() {
        return this.stories.active?.processedProps[this.props].help
    }
}
