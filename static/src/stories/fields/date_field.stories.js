import { registry } from "@web/core/registry";

const serverData = {
    models: {
        foo: {
            fields: {
                date: { string: "Date", type: "date" },
            },
        },
    },
    views: {},
};

const attrs = {
    placeholder: {
        type: String,
    },
    // We do not support recursive subOptions yet
    // options: {
    //     subAttrs: true,
    //     type: {
    //         subAttrs: true,
    //         warn_future: {
    //             type: Boolean,
    //             value: true,
    //         },
    //     },
    // },

    // options="{ 'datepicker': { 'warn_future': true } }"
};

const formWithDateField = {
    title: "Date field",
    model: "foo",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <group>
            <field name="date" {{attrs}}/>
        </group>
    </sheet>
</form>`,
    serverData,
};

export const FormDateStories = {
    title: "Fields",
    module: "web",
    stories: [formWithDateField],
};

registry.category("stories").add("owlybook.formWithDateField", FormDateStories);
