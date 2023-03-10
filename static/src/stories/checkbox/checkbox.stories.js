/** @odoo-module */

import { Component } from "@odoo/owl";
import { CheckBox } from "@web/core/checkbox/checkbox";
import { registry } from "@web/core/registry";
import { getEventFunction } from "../utils/utils";

class CheckBoxParent extends Component {
    static template = "ui_playground.CheckBoxStories";
    static components = { CheckBox };
}

CheckBoxParent.codeTemplate = "ui_playground.CheckBoxCall";
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
        },
    },
};

export const CheckBoxStories = {
    title: "Core components",
    module: "web",
    stories: [CheckBoxParent],
};

registry.category("stories").add("ui_playground.checkbox", CheckBoxStories);
