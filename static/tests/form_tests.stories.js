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

const attrs = {
    string: {
        type: String,
        choices: ["Paper", "Rock", "Cissor"],
        value: "Paper",
    },
    password: {
        type: Boolean,
        value: "true",
    },
    options: {
        subAttrs: true,
        dynamic_placeholder: {
            type: Boolean,
        },
    },
};

const formExampleWithAttrs = {
    title: "Form example attrs",
    model: "order",
    viewType: "form",
    attrs,
    arch: `<form><sheet><group><field name="description" {{attrs}} /></group></sheet></form>`,
    serverData,
};

const formExample = {
    title: "Form example",
    model: "order",
    viewType: "form",
    arch: `<form><sheet><group><field name="description"/><field name="image_url"/></group></sheet></form>`,
    serverData,
};

export const FormStories = {
    title: "Form",
    module: "web",
    stories: [formExample, formExampleWithAttrs],
};
