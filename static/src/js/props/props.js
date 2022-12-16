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
}
