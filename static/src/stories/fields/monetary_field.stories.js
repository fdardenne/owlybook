/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                monetary_field: {
                    string: "Monetary Field",
                    type: "monetary",
                },
                currency_id: {
                    string: "Currency",
                    type: "many2one",
                    relation: "currency",
                    searchable: true,
                    default: 1,
                },
            },
        },
        currency: {
            fields: {
                digits: { string: "Digits" },
                symbol: { string: "Currency Sumbol", type: "char", searchable: true },
                position: { string: "Currency Position", type: "char", searchable: true },
            },
            records: [{ id: 1, display_name: "$", symbol: "$", position: "before" }],
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
        currency_field: {
            type: String,
            optional: true,
            value: "currency_id",
            readonly: true,
        },
        field_digits: {
            type: Boolean,
            optional: true,
        },
        no_symbol: {
            type: Boolean,
            optional: true,
        },
    },
    type: {
        type: String,
        optional: true,
        choices: ["text", "number"],
    },
};

const formWithMonetaryField = {
    title: "Monetary Field",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <group>
            <field name="monetary_field" {{attrs}} />
            <field name="currency_id" invisible="1"/>
        </group>
    </sheet>
</form>`,
    serverData,
};

export const FormMonetaryStories = {
    title: "Fields",
    module: "web",
    stories: [formWithMonetaryField],
};

registry.category("stories").add("ui_playground.formWithMonetaryField", FormMonetaryStories);
