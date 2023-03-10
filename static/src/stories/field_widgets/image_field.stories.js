/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        foo: {
            fields: {
                image: { string: "Binary", type: "binary" },
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
            type: Array,
            choices: [
                {label: "[0,90]", value:[0, 90]},
                {label: "[0,30]", value:[0, 30]},
            ],
            value: [0, 30],
        },
    }
};

const formWithImageField = {
    title: "Image field",
    model: "foo",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <group>
            <field name="image" widget="image" {{attrs}}/>
        </group>
    </sheet>
</form>`,
    serverData,
};

export const FormImageStories = {
    title: "Fields",
    module: "web",
    stories: [formWithImageField],
};

registry.category("stories").add("ui_playground.formWithImageField", FormImageStories);
