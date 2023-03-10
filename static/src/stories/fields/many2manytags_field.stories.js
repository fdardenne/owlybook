/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                display_name: { string: "Displayed name", type: "char" },
                timmy: { string: "pokemon", type: "many2many", relation: "partner_type" },
            },
        },
        partner_type: {
            fields: {
                name: { string: "Partner Type", type: "char" },
            },
            records: [
                { id: 12, display_name: "gold" },
                { id: 14, display_name: "silver" },
            ],
        },
    },
    views: {},
};

const attrs = {
    placeholder: {
        type: String,
        optional: true,
    },
    options: {
        subAttrs: true,
        no_create: {
            type: Boolean,
            optional: true,
        },
        no_quick_create: {
            type: Boolean,
            optional: true,
        },
        no_create_edit: {
            type: Boolean,
            optional: true,
        },
        color_field: {
            type: String,
            optional: true,
        },
        create_name_field: {
            type: String,
            optional: true,
        },
        create: {
            type: Boolean,
            optional: true,
        },
    },
};

const formWithMany2ManyTagsField = {
    title: "Many2Many Tags Field",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <group>
            <field name="timmy" widget="many2many_tags" {{attrs}}/>
        </group>
    </sheet>
</form>`,
    serverData,
};

export const FormMany2ManyTagsStories = {
    title: "Fields",
    module: "web",
    stories: [formWithMany2ManyTagsField],
};

registry.category("stories").add("ui_playground.formWithMany2ManyTagsField", FormMany2ManyTagsStories);
