import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                display_name: { string: "Displayed name", type: "char" },
            },
        },
    },
    views: {},
};

const attrs = {
    string: { type: String, value: "Attach document" },
    action: { type: String, optional: true, value: "my_action", readonly: true },
    highlight: { type: Boolean },
};

const formWithAttachDocument = {
    title: "Attach Document",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <group>
            <field name="display_name" required="1"/>
            <widget name="attach_document" {{attrs}}/>
        </group>
    </sheet>
</form>`,
    serverData,
    mockRPC(route, args) {
        if (args.method === "my_action") {
            return false;
        }
    },
};

export const FormAttachDocumentStories = {
    title: "Widget",
    module: "web",
    stories: [formWithAttachDocument],
};

registry.category("stories").add("owlybook.formWithAttachDocument", FormAttachDocumentStories);
