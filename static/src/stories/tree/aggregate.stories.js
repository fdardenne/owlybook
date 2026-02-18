import { registry } from "@web/core/registry";

const serverData = {
    models: {
        order: {
            fields: {
                int_field: { string: "Integer", type: "integer" },
                description: { string: "Description", type: "char" },
            },
            records: [
                {
                    id: 1,
                    int_field: 0,
                    description: 'Try to do a formula in the integer field like "=2*3" or "=6/2"',
                },
            ],
        },
    },
    views: {},
};

const AggregateExample = {
    title: "List Aggregate",
    model: "order",
    viewType: "list",
    arch: `<list editable="bottom">
    <field name="description"/>
    <field name="int_field"/>
</list>`,
    serverData,
};

export const AggregateStories = {
    title: "List",
    module: "web",
    stories: [AggregateExample],
};

registry.category("stories").add("owlybook.Aggregate", AggregateStories);
