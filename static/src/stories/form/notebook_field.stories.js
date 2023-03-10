/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {},
        },
    },
    views: {},
};

const attrs = {
    className: { type: String, optional: true },
    defaultPage: { type: String, optional: true },
    orientation: { type: String, optional: true },
};

const formWithNotebook = {
    title: "Notebook",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <notebook>
            <page string="Options">
            </page>
        </notebook>
    </sheet>
</form>`,
    serverData,
};

export const FormNotebookStories = {
    title: "Form",
    module: "web",
    stories: [formWithNotebook],
};

registry.category("stories").add("ui_playground.formWithNotebook", FormNotebookStories);
