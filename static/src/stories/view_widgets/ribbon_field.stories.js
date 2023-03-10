/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                display_name: { string: "Displayed name", type: "char" },
                timmy: { string: "pokemon", type: "many2many", relation: "partner_type" },
            },
        },
    },
    views: {},
};

const attrs = {
    text: { type: String, value: "ribbon" },
    tooltip: { type: String, optional: true, value: "this is a tooltip" },
    bg_color: {
        type: String,
        optional: true,
        value: "bg-success",
        choices: [
            { label: "bg-success", value: "bg-success" },
            { label: "bg-warning", value: "bg-warning" },
            { label: "bg-danger", value: "bg-danger" },
        ],
    },
};

const formWithRibbon = {
    title: "Ribbon",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <widget name="web_ribbon" {{attrs}}/>
    </sheet>
</form>`,
    serverData,
};

export const FormRibbonStories = {
    title: "Widget",
    module: "web",
    stories: [formWithRibbon],
};

registry.category("stories").add("ui_playground.formWithRibbon", FormRibbonStories);
