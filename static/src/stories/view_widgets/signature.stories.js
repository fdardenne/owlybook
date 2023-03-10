/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                customer_signature: { string: "Signature", type: "binary" },
            },
            records: [
                {
                    id: 1,
                },
            ],
        },
    },
    views: {},
};

const attrs = {
    full_name: { type: String, optional: true },
    highlight: { type: Boolean, optional: true, help: "Set 'btn-primary' class on the button" },
    string: { type: String, value: "Sign" },
    signature_field: { type: String, optional: true, value: "customer_signature" },
};

const formWithSignature = {
    title: "Signature",
    model: "partner",
    viewType: "form",
    resId: 1,
    attrs,
    arch: `<form>
    <header>
        <widget name="signature" {{attrs}}/>
    </header>
    <sheet>
        <div>The field below is not the signature widget, it's the signature field. <br/>
        The signature widget will write in the customer_signature field as specified in the
        properties.</div>
        <group>
            <field name="customer_signature" widget="signature"/>
        </group>
    </sheet>
</form>`,
    serverData,
};

export const FormSignatureStories = {
    title: "Widget",
    module: "web",
    stories: [formWithSignature],
};

registry.category("stories").add("ui_playground.formWithSignature", FormSignatureStories);
