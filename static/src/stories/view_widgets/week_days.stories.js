/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                id: { type: "integer", string: "ID" },
                sun: { type: "boolean", string: "Sun" },
                mon: { type: "boolean", string: "Mon" },
                tue: { type: "boolean", string: "Tue" },
                wed: { type: "boolean", string: "Wed" },
                thu: { type: "boolean", string: "Thu" },
                fri: { type: "boolean", string: "Fri" },
                sat: { type: "boolean", string: "Sat" },
            },
            records: [
                {
                    id: 1,
                    sun: false,
                    mon: false,
                    tue: false,
                    wed: false,
                    thu: false,
                    fri: false,
                    sat: false,
                },
            ],
        },
    },
    views: {},
};

const formWithWeekDays = {
    title: "Week Days",
    model: "partner",
    viewType: "form",
    arch: `<form>
    <group>
        <widget name="week_days" colspan="2"/>
    </group>
</form>`,
    serverData,
};

export const FormWeekDaysStories = {
    title: "Widget",
    module: "web",
    stories: [formWithWeekDays],
};

registry.category("stories").add("owlybook.formWithWeekDays", FormWeekDaysStories);
