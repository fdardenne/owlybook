/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {},
    },
    views: {},
};

const attrs = {
    full_name: { type: String, optional: true },
    highlight: { type: Boolean, optional: true },
    string: { type: String, value: "Sign" },
    signature_field: { type: String, optional: true },
};

const formWithSignature = {
    title: "Signature",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <header>
        <widget name="signature" {{attrs}}/>
    </header>
</form>`,
    serverData,
};

export const FormSignatureStories = {
    title: "Widget",
    module: "web",
    stories: [formWithSignature],
};

registry.category("stories").add("ui_playground.formWithSignature", FormSignatureStories);
