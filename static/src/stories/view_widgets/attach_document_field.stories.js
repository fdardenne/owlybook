/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                display_name: { string: "Displayed name", type: "char" },
            },
        },
    },
    views: {},
};

const attrs = {
    string: { type: String },
    action: { type: String, optional: true },
    highlight: { type: Boolean },
};

const formWithAttachDocument = {
    title: "Attach Document",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <widget name="attach_document" action="my_action" string="Attach document"/>
        <field name="display_name" required="1"/>
    </sheet>
</form>`,
    serverData,
};

export const FormAttachDocumentStories = {
    title: "Widget",
    module: "web",
    stories: [formWithAttachDocument],
};

registry.category("stories").add("ui_playground.formWithAttachDocument", FormAttachDocumentStories);
