/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useStories } from "../stories";

export class Props extends Component {
    static template = "ui_playground.props";

    setup() {
        this.stories = useStories();
    }

    get storyProps() {
        return this.stories.active?.processedProps || {};
    }

    /**
     * This function allow to display the value of the help entrie of each props in the tooltip
     * @returns {string} - The value to be displayed
     */
    get tooltipInfo() {
        return JSON.stringify({
            help: this.stories.active?.processedProps[this.props].help,
        });
    }
}
