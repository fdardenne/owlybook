/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {},
    },
    views: {},
};

const attrs = {
    path: { type: String, value: "http://www.odoo.com/" },
};

const formWithDocumentationLink = {
    title: "Documentation Link",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <widget name="documentation_link" {{attrs}}/>
    </sheet>
</form>`,
    serverData,
};

export const FormDocumentationLinkStories = {
    title: "Widget",
    module: "web",
    stories: [formWithDocumentationLink],
};

registry
    .category("stories")
    .add("ui_playground.formWithDocumentationLink", FormDocumentationLinkStories);
