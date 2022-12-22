/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { useStories } from "../stories";
import { Props } from "../props/props";

export class Panel extends Component {
    static template = "ui_playground.panel";
    static components = { Props };

    setup() {
        this.stories = useStories();
        this.state = useState({ mode: "props" });
    }

    changeMode(mode) {
        this.state.mode = mode;
    }
}
