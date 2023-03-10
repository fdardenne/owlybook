/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                display_name: { string: "Displayed name", type: "char", searchable: true },
                sequence: { type: "integer", string: "Sequence", searchable: true },
            },
            records: [
                {
                    id: 1,
                    display_name: "first record",
                },
                {
                    id: 2,
                    display_name: "second record",
                    sequence: 4,
                },
                {
                    id: 4,
                    display_name: "aaa",
                    sequence: 9,
                },
            ],
        },
    },
    views: {},
};

const formWithHandleField = {
    title: "Handle field",
    model: "partner",
    viewType: "list",
    arch: `<tree>
    <field name="sequence" widget="handle"/>
    <field name="display_name" />
</tree>`,
    serverData,
};

export const FormHandleStories = {
    title: "Fields",
    module: "web",
    stories: [formWithHandleField],
};

registry.category("stories").add("ui_playground.formWithHandleField", FormHandleStories);
