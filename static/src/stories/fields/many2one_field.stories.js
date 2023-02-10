/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        foo: {
            fields: {
                product: { string: "Product", type: "many2one", relation: "product" },
            },
        },
        product: {
            fields: {
                name: { string: "Product Name", type: "char" },
            },
            records: [
                {
                    id: 1,
                    display_name: "Paper",
                },
                {
                    id: 2,
                    display_name: "Printer",
                },
            ],
        },
    },
    views: {
        "product,false,form": `
            <form>
                <field name="display_name"/>
            </form>`,
    },
};

const mockRPC = function (route, args) {
    if (args.method === "get_formview_action") {
        return {
            type: "ir.actions.act_window",
            res_model: "product",
            view_type: "form",
            view_mode: "form",
            views: [[false, "form"]],
            target: "current",
            res_id: args.args[0],
        };
    }
};

const attrs = {
    options: {
        subAttrs: true,
        no_create: {
            type: Boolean,
        },
    },
};

const formWithMany2oneField = {
    title: "Many2one form view",
    model: "foo",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <group>
            <field name="product" {{attrs}}/>
        </group>
    </sheet>
</form>`,
    serverData,
    mockRPC,
};

const Many2oneStories = {
    title: "Many2one Field",
    module: "web",
    stories: [formWithMany2oneField],
};

registry.category("stories").add("ui_playground.formWithOne2ManyField", Many2oneStories);
