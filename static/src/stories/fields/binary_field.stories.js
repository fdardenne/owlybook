/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                document: { string: "Binary", type: "binary" },
                filename: { string: "Filename", type: "char" },
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
        acceptedFileExtensions: {
            type: String,
            optional: true,
            value: "*",
        },
    },
    filename: {
        type: String,
        optional: true,
        value: "filename",
    },
};

const formWithBinaryField = {
    title: "Binary Field",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <group>
            <field name="document" {{attrs}}/>
            <field name="filename"/>
        </group>
    </sheet>
</form>`,
    serverData,
};

export const FormBinaryStories = {
    title: "Fields",
    module: "web",
    stories: [formWithBinaryField],
};

registry.category("stories").add("ui_playground.formWithBinaryField", FormBinaryStories);
