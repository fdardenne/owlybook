/** @odoo-module */

import { DateTimePicker } from "@web/core/datetime/datetime_picker";
import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
import { getEventFunction } from "../../js/stories";

class DateTimePickerParent extends Component {
    static template = "owlybook.DatePickerStories";
    static components = { DateTimePicker };
}

DateTimePickerParent.codeTemplate = "owlybook.DatePickerCall";
DateTimePickerParent.storyConfig = {
    title: "DateTimePicker",
    component: DateTimePicker,
    props: {
        onSelect: {
            value: getEventFunction("onSelect"),
            help: "Called when the user select a date",
        },
    },
};

export const DateTimePickerStories = {
    title: "Core components",
    module: "web",
    stories: [DateTimePickerParent],
};

registry.category("stories").add("owlybook.datepicker", DateTimePickerStories);
