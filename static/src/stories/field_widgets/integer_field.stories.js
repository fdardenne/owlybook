/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        foo: {
            fields: {
                number: { string: "Password", type: "integer" },
            },
        },
    },
    views: {},
};

const attrs = {
    placeholder: {
        type: String,
    },
    options: {
        subAttrs: true,
        type: {
            type: String,
            choices: ["number"],
            value: "number",
        },
        step: {
            type: Number,
            value: 5,
        },
    },
};

const formWithIntegerField = {
    title: "Integer field",
    model: "foo",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <group>
            <field name="number" {{attrs}}/>
        </group>
    </sheet>
</form>`,
    serverData,
};

export const FormIntegerStories = {
    title: "Fields",
    module: "web",
    stories: [formWithIntegerField],
};

registry.category("stories").add("ui_playground.formWithIntegerField", FormIntegerStories);
