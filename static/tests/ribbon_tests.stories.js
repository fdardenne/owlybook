import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            fields: {
                display_name: { string: "Displayed name", type: "char" },
                timmy: { string: "pokemon", type: "many2many", relation: "partner_type" },
            },
        },
    },
    views: {},
};

const attrs = {
    text: { type: String, value: "ribbon" },
    tooltip: { type: String, optional: true, value: "this is a tooltip" },
    bg_color: {
        type: String,
        optional: true,
        value: "bg-success",
        choices: [
            { label: "bg-success", value: "bg-success" },
            { label: "bg-warning", value: "bg-warning" },
            { label: "bg-danger", value: "bg-danger" },
        ],
    },
};

const formWithRibbon = {
    title: "Ribbon",
    model: "partner",
    viewType: "form",
    attrs,
    arch: `<form>
    <sheet>
        <widget name="web_ribbon" {{attrs}}/>
            <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. In id tellus et enim sodales lacinia. Ut non pellentesque nunc, eu volutpat metus. Donec vitae dapibus purus, quis pretium tellus. In vehicula ligula sed finibus tempus. Sed sit amet efficitur tortor. Nunc non augue diam. Mauris in mauris hendrerit, malesuada felis vel, rhoncus nulla. Aliquam nisi magna, rhoncus non scelerisque in, eleifend ut turpis. Phasellus in ornare tortor, id fermentum justo. In sed cursus enim.
            </div>
    </sheet>
</form>`,
    serverData,
};

export const FormRibbonStories = {
    title: "Widget",
    module: "web",
    stories: [formWithRibbon],
};

registry.category("stories").add("owlybook.formWithRibbon", FormRibbonStories);
