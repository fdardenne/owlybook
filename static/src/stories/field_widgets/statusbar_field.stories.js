/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                status_bar: { string: "status_bar", type: "many2one", relation: "partner" },
            },
            records: [
                { id: 1, display_name: "First", status_bar: 4 },
                { id: 2, display_name: "Second", status_bar: 1 },
                { id: 4, display_name: "Third" },
            ],
        },
    },
    views: {},
};

const attrs = {
    statusbar_visible: {
        type: String,
        optional: true,
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
        },
    },
};

const formWithStatusBarField = {
    title: "Status Bar field",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <header>
            <field name="status_bar" widget="statusbar" {{attrs}}/>
        </header>
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
