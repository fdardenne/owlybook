/** @odoo-module */

import { DatePicker } from "@web/core/datepicker/datepicker";
import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
import { getEventFunction } from "../utils/utils";

class DatePickerParent extends Component {
    static template = "ui_playground.DatePickerStories";
    static components = { DatePicker };
}

DatePickerParent.codeTemplate = "ui_playground.DatePickerCall";
DatePickerParent.storyConfig = {
    title: "DatePicker",
    component: DatePicker,
    props: {
        placeholder: {
            value: "Pick a date ...",
        },
        format: {
            value: "dd/MM/yyyy",
        },
        readonly: {
            value: false,
        },
        onDateTimeChanged: {
            value: getEventFunction("onDateTimeChanged"),
        },
    },
};

export const DatePickerStories = {
    title: "Core components",
    module: "web",
    stories: [DatePickerParent],
};

registry.category("stories").add("ui_playground.datepicker", DatePickerStories);
