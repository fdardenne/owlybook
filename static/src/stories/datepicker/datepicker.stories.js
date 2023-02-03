/** @odoo-module */

import { DatePicker } from "@web/core/datepicker/datepicker";
import { registry } from "@web/core/registry";

const storyA = {
    title: "DatePicker",
    component: DatePicker,
    props: {
        placeholder: {
            default: "Pick a date ...",
            dynamic: true,
        },
        format: {
            dynamic: true,
            default: "dd/MM/yyyy",
        },
        readonly: {
            dynamic: true,
            default: false,
        }
    },
};

export const DatePickerStories = {
    title: "DatePicker",
    module: "web",
    stories: [storyA],
};

registry.category("stories").add("ui_playground.datepicker", DatePickerStories);
