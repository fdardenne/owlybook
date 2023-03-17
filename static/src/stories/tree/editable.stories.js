/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        order: {
            fields: {
                int_field: { string: "Integer", type: "integer" },
                description: { string: "Description", type: "char" },
            },
            records: [
                {
                    id: 1,
                    int_field: 0,
                    description: "Try to add a new element,",
                },
                {
                    id: 2,
                    int_field: 0,
                    description: "depending on the editable top or bottom,",
                },
                {
                    id: 3,
                    int_field: 0,
                    description: "the element will be added on top or at the bottom",
                },
            ],
        },
    },
    views: {},
};

const EditableExample = {
    title: "List Editable",
    model: "order",
    viewType: "list",
    arch: `<tree editable="bottom">
    <field name="description"/>
    <field name="int_field"/>
</tree>`,
    serverData,
};

export const EditableStories = {
    title: "List",
    module: "web",
    stories: [EditableExample],
};

registry.category("stories").add("owlybook.Editable", EditableStories);
