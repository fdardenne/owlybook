/** @odoo-module */

import { Component } from "@odoo/owl";
import { CheckBox } from "@web/core/checkbox/checkbox";
import { registry } from "@web/core/registry";
import { getEventFunction } from "../src/js/stories";

class CheckBoxParentTest extends Component {
    static template = "owlybook.CheckBoxStoriesTest";
    static components = { CheckBox };
}

CheckBoxParentTest.codeTemplate = "owlybook.CheckBoxCallTest";
CheckBoxParentTest.storyConfig = {
    title: "Checkbox",
    component: CheckBox,
    props: {
        value: {
            value: true,
        },
        className: {
            value: "form-switch",
        },
        name: {
            value: "beautiful_name",
            help: "tooltip test",
        },
        onChange: {
            value: getEventFunction("onChange"),
            help: "Called when the user clicked on the checkbox",
        },
    },
};

export const CheckBoxStories = {
    title: "Core components",
    module: "web",
    stories: [CheckBoxParentTest],
};

export const CheckBoxStories2 = {
    title: "Core components",
    module: "web",
    stories: [CheckBoxParentTest],
};
registry.category("stories").add("owlybook.checkbox", CheckBoxStories);
registry.category("stories").add("owlybook.checkbox2", CheckBoxStories2);
