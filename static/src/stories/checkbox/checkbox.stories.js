/** @odoo-module */

import { Component, xml } from "@odoo/owl";
import { CheckBox } from "@web/core/checkbox/checkbox";
import { registry } from "@web/core/registry";
import { getEventFunction } from "../utils/utils";

class CheckboxParent extends Component {
    static storyConfig = {
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

    static template = "ui_playground.CheckBoxStories";
    static codeTemplate = "ui_playground.CheckBoxCall";
    static components = { CheckBox };
}

export const CheckBoxStories = {
    title: "Core components",
    module: "web",
    stories: [CheckboxParent],
};

registry.category("stories").add("ui_playground.checkbox", CheckBoxStories);
