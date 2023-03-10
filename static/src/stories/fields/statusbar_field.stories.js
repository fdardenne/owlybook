/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                status_bar: {
                    type: "selection",
                    selection: [
                        ["first", "First"],
                        ["second", "Second"],
                        ["third", "Third"],
                    ],
                },
            },
        },
    },
    views: {},
};

const attrs = {
    statusbar_visible: {
        type: String,
        optional: true,
        value: "first,second,third",
    },
    can_create: {
        type: Boolean,
        optional: true,
    },
    can_write: {
        type: Boolean,
        optional: true,
    },
    options: {
        subAttrs: true,
        clickable: {
            type: Boolean,
            optional: true,
            value: true,
        },
    },
};

const formWithStatusBarField = {
    title: "Status Bar field",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <header>
        <field name="status_bar" widget="statusbar" {{attrs}}/>
    </header>
    <sheet>
    </sheet>
</form>`,
    serverData,
};

export const FormStatusBarStories = {
    title: "Fields",
    module: "web",
    stories: [formWithStatusBarField],
};

registry.category("stories").add("ui_playground.formWithStatusBarField", FormStatusBarStories);
