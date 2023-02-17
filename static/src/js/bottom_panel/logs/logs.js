/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { useStories } from "../../stories";

export class Logs extends Component {
    static template = "ui_playground.logs";

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
