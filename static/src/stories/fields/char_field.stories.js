/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        foo: {
            fields: {
                passwd: { string: "Password", type: "char" },
            },
        },
    },
    views: {},
};

const attrs = {
    string: {
        type: String,
        value: "A password",
    },
    password: {
        type: Boolean,
        value: "true",
    },
    placeholder: {
        type: String,
    },
    autocomplete: {
        type: Boolean,
    },
    options: {
        subAttrs: true,
        dynamic_placeholder: {
            type: Boolean,
        },
    },
};

const formWithCharField = {
    title: "Char field",
    model: "foo",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <group>
            <field name="passwd" {{attrs}}/>
        </group>
    </sheet>
</form>`,
    serverData,
};

export const FormStories = {
    title: "Fields",
    module: "web",
    stories: [formWithCharField],
};

registry.category("stories").add("owlybook.formWithCharField", FormStories);
