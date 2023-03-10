/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { useStories } from "../../stories";

export class Events extends Component {
    static template = "ui_playground.events";

    setup() {
        this.stories = useStories();
        this.uncollapsed = useState({});
    }

    toggleCollapse(uncollapsedObject, log_id) {
        if (uncollapsedObject[log_id]) {
            uncollapsedObject[log_id] = undefined;
        } else {
            uncollapsedObject[log_id] = {};
        }
    }

    get storyEvents() {
        return this.stories.active?.events || {};
    }
}
