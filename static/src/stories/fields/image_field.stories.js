/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        foo: {
            fields: {
                image: { string: "Image", type: "binary" },
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
        size: {
            type: Array,
            choices: [
                { label: "[0,30]", value: [0, 30] },
                { label: "[0,90]", value: [0, 90] },
                { label: "[0,180]", value: [0, 180] },
                { label: "[0,300]", value: [0, 300] },
            ],
            value: [0, 180],
        },
    },
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

registry.category("stories").add("owlybook.formWithImageField", FormImageStories);
