import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {},
        },
    },
    views: {},
};

const attrs = {
    class: { type: String, optional: true },
};

const formWithNotebook = {
    title: "Notebook",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <notebook {{attrs}}>
            <page string="First page">
                <div>
                    Hello
                </div>
            </page>
            <page string="Second page">
                <div>
                    World
                </div>
            </page>
        </notebook>
    </sheet>
</form>`,
    serverData,
};

export const FormNotebookStories = {
    title: "Form",
    module: "web",
    stories: [formWithNotebook],
};

registry.category("stories").add("owlybook.formWithNotebook", FormNotebookStories);
