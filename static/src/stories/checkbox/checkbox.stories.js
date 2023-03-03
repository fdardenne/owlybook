/** @odoo-module */

import { CheckBox } from "@web/core/checkbox/checkbox";
import { registry } from "@web/core/registry";
import { getEventFunction } from "../utils/utils";

const storyA = {
    title: "CheckboxFirstStory",
    component: CheckBox,
    props: {
        disabled: {
            dynamic: true,
            default: true,
        },
        value: {
            dynamic: true,
            default: true,
        },
        className: {
            dynamic: true,
            default: "form-switch",
        },
        name: {
            default: "beautiful_name",
        },
        onChange: {
            default: getEventFunction("onChange"),
        },
    },
};

const storyB = {
    title: "CheckboxSecondStory",
    component: CheckBox,
    props: {
        disabled: {
            dynamic: true,
            default: false,
        },
        value: {
            dynamic: true,
            default: true,
        },
        className: {
            dynamic: true,
        },
        name: {
            default: "beautiful_name",
        },
    },
};

export const CheckBoxStories = {
    title: "Checkbox",
    module: "web",
    stories: [storyA, storyB],
};

registry.category("stories").add("ui_playground.checkbox", CheckBoxStories);
