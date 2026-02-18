import { registry } from "@web/core/registry";

const serverData = {
    models: {
        foo: {
            fields: {
                number: { string: "Integer", type: "integer" },
            },
        },
    },
    views: {},
};

const attrs = {
    placeholder: {
        type: String,
    },
    options: {
        subAttrs: true,
        type: {
            type: String,
            choices: ["number"],
            value: "number",
        },
    },
};

const formWithIntegerField = {
    title: "Integer field",
    model: "foo",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <group>
            <field name="number" {{attrs}}/>
        </group>
    </sheet>
</form>`,
    serverData,
};

export const FormIntegerStories = {
    title: "Fields",
    module: "web",
    stories: [formWithIntegerField],
};

registry.category("stories").add("owlybook.formWithIntegerField", FormIntegerStories);
