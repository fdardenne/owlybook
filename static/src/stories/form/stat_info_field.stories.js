import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                monetary: { string: "Monetary", type: "monetary" },
            },
            records: [
                {
                    id: 1,
                    monetary: 9.999999,
                },
            ],
        },
    },
    views: {},
};

const attrs = {
    string: { type: String, optional: true },
    noLabel: { type: String, optional: true },
    options: {
        subAttrs: true,
        digits: {
            type: String,
            optional: true,
        },
        label_field: {
            type: String,
            optional: true,
        },
    },
};

const formWithStatInfo = {
    title: "StatInfo",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `
<form>
    <sheet>
        <div class="oe_button_box" name="button_box">
            <button class="oe_stat_button" name="money" icon="fa-money">
                <field name="monetary" widget="statinfo" {{attrs}}/>
            </button>
        </div>
        <group>
            <field name="monetary" invisible="1" />
        </group>
    </sheet>
</form>`,
    serverData,
};

export const FormStatInfoStories = {
    title: "Form",
    module: "web",
    stories: [formWithStatInfo],
};

registry.category("stories").add("owlybook.formWithStatInfo", FormStatInfoStories);
