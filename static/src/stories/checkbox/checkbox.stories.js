/** @odoo-module */

import { CheckBox } from "@web/core/checkbox/checkbox";
import { registry } from "@web/core/registry";
const { Component, xml } = owl;

class StoryA extends Component {
    static template = xml`<CheckBox/>`;
    static components = { CheckBox };
    static title = "Checkbox first story";
}

class StoryB extends Component {
    static template = xml`<CheckBox/>`;
    static components = { CheckBox };
    static title = "Checkbox second story";
}

export const CheckBoxStories = {
    title: "Checkbox",
    module: "web",
    stories: [StoryA, StoryB],
};

registry.category("stories").add("ui_playground.checkbox", CheckBoxStories);
