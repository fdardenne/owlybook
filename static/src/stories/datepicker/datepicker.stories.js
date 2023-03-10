/** @odoo-module */

import { DatePicker } from "@web/core/datepicker/datepicker";
import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
import { getEventFunction } from "../utils/utils";

class DatePickerParent extends Component {
    static storyConfig = {
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
            },
            onDateTimeChanged: {
                default: getEventFunction("onDateTimeChanged"),
            },
        },
    };

    static template = "ui_playground.DatePickerStories";
    static codeTemplate = "ui_playground.DatePickerCall";
    static components = { DatePicker };
}

export const DatePickerStories = {
    title: "Core components",
    module: "web",
    stories: [DatePickerParent],
};

registry.category("stories").add("ui_playground.datepicker", DatePickerStories);
