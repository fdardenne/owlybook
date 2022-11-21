/** @odoo-module **/

import { useStories } from "../stories";

const { Component, useState } = owl;

export class Canvas extends Component {
    setup() {
        this.stories = useStories();
    }
}

Canvas.template = "storybook.canvas";
