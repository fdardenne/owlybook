/** @odoo-module */

import { CheckBox } from "@web/core/checkbox/checkbox";

export const storyA = {
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
    },
};

export const storyB = {
    title: "CheckboxSecondStory",
    component: CheckBox,
    props: {
        disabled: {
            dynamic: true,
            default: false,
            help: "this is a magnificent tooltip"
        },
        value: {
            dynamic: true,
            default: true,
            help: "Oh ! another tooltip"
        },
        className: {
            dynamic: true,
        },
        name: {
            default: "beautiful_name",
            help: "Last but not least"
        },
    },
};

export const storyWithoutPropsDef = {
    title: "CheckboxThirdStory",
    component: CheckBox,
};

export const CheckBoxStories = {
    title: "Checkbox",
    module: "web",
    stories: [storyA, storyB],
};
