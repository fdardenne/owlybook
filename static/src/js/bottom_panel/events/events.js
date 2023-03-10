/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useStories } from "../../stories";
import { ObjectRenderer } from "../../components/object_renderer/object_renderer";

export class Events extends Component {
    static template = "ui_playground.events";
    static components = { ObjectRenderer };

    setup() {
        this.stories = useStories();
    }

    get storyEvents() {
        return this.stories.active?.events || {};
    }
}
