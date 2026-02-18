import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                color: {
                    type: "selection",
                    selection: [
                        ["red", "Red"],
                        ["black", "Black"],
                    ],
                    default: "red",
                    string: "Color",
                },
            },
        },
    },
    views: {},
};

const attrs = {
    options: {
        subAttrs: true,
        horizontal: {
            type: Boolean,
            optional: true,
        },
    },
};

const formWithRadioField = {
    title: "Radio field",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <group>
            <field name="color" widget="radio" {{attrs}}/>
        </group>
    </sheet>
</form>`,
    serverData,
};

export const FormRadioStories = {
    title: "Fields",
    module: "web",
    stories: [formWithRadioField],
};

registry.category("stories").add("owlybook.formWithRadioField", FormRadioStories);
