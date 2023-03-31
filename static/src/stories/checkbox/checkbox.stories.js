/** @odoo-module */

import { Component } from "@odoo/owl";
import { CheckBox } from "@web/core/checkbox/checkbox";
import { registry } from "@web/core/registry";
import { getEventFunction } from "../../js/stories";

class CheckBoxParent extends Component {
    static template = "owlybook.CheckBoxStories";
    static components = { CheckBox };
}

CheckBoxParent.codeTemplate = "owlybook.CheckBoxCall";
CheckBoxParent.storyConfig = {
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
    stories: [CheckBoxParent],
};

registry.category("stories").add("owlybook.checkbox", CheckBoxStories);
