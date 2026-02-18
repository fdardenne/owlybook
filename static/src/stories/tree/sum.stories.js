import { registry } from "@web/core/registry";

const serverData = {
    models: {
        order: {
            fields: {
                int_field: { string: "Sum", type: "integer" },
                int_field_avg: { string: "Average", type: "integer" },
                description: { string: "Description", type: "char" },
            },
            records: [
                {
                    id: 1,
                    int_field: 0,
                    int_field_avg: 0,
                    description:
                        "Every time you put an number in the Sum or Average field, you will see the sum and average will be computed",
                },
            ],
        },
    },
    views: {},
};

const SumExample = {
    title: "List Sum and Average",
    model: "order",
    viewType: "list",
    arch: `<list editable="bottom">
    <field name="description"/>
    <field name="int_field" sum="Total"/>
    <field name="int_field_avg" avg="Average"/>
</list>`,
    serverData,
};

export const SumStories = {
    title: "List",
    module: "web",
    stories: [SumExample],
};

registry.category("stories").add("owlybook.Sum", SumStories);
