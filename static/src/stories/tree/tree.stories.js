/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        order: {
            fields: {
                image_url: { string: "Image", type: "char" },
                description: { string: "Description", type: "char" },
            },
            records: [
                {
                    id: 1,
                    image_url: "",
                    description: "A nice description",
                },
                {
                    id: 2,
                    image_url: "",
                    description: "A second nice description",
                },
            ],
        },
    },
    views: {},
};

const treeExample = {
    title: "Tree",
    model: "order",
    viewType: "list",
    arch: `<tree>
    <field name="description"/>
    <field name="image_url"/>
</tree>`,
    serverData,
};

export const TreeStories = {
    title: "Tree",
    module: "web",
    stories: [treeExample],
};

registry.category("stories").add("ui_playground.tree", TreeStories);
