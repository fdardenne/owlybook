import { stories } from "@owlybook/story/story_registry";

/** A date `days` days ago, so the calendar of today shows the orders. */
function daysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
}

const PRODUCTS = [
    ["Office chair", 120],
    ["Standing desk", 450],
    ["Monitor", 210.5],
    ["Desk lamp", 35],
];

// Fifteen orders over the last two months, for lists, pivots and graphs.
const LINES = [];
const ORDERS = [];
for (let index = 0; index < 15; index++) {
    const lineIds = [];
    for (let line = 0; line <= index % 3; line++) {
        const [name, price] = PRODUCTS[(index + line) % PRODUCTS.length];
        LINES.push({ id: LINES.length + 1, name, price, quantity: 1 + ((index * 7 + line * 3) % 5) });
        lineIds.push(LINES.length);
    }
    ORDERS.push({
        id: index + 1,
        name: `S000${42 + index}`,
        partner_id: 1 + ((index * 3) % 5),
        date_order: daysAgo(index * 4),
        tag_ids: index % 4 === 0 ? [2, 4] : [2],
        state: ["sent", "draft", "sale"][index % 3],
        line_ids: lineIds,
        currency_id: 1,
        note: index === 0 ? "Delivery on Monday." : false,
    });
}

const salesModels = {
    "sale.order": {
        fields: {
            name: "char",
            partner_id: { type: "many2one", relation: "res.partner", string: "Customer" },
            date_order: { type: "date", string: "Order Date" },
            tag_ids: { type: "many2many", relation: "story.tag" },
            state: {
                type: "selection",
                selection: [
                    ["draft", "Quotation"],
                    ["sent", "Quotation Sent"],
                    ["sale", "Sales Order"],
                ],
            },
            line_ids: { type: "one2many", relation: "story.line", string: "Order Lines" },
            amount_total: {
                type: "monetary",
                string: "Total",
                // Like a Python computed field: the view calls onchange when a
                // line changes, and the total follows.
                depends: ["line_ids.subtotal"],
                compute: (order) => order.line_ids.reduce((total, line) => total + line.subtotal, 0),
            },
            currency_id: { type: "many2one", relation: "res.currency" },
            note: "text",
        },
        records: ORDERS,
        // Called when the customer changes, like a Python onchange method.
        onchange: {
            partner_id(order, { getRecord }) {
                const partner = order.partner_id && getRecord("res.partner", order.partner_id);
                order.note = partner ? `Quotation prepared for ${partner.name} (${partner.email}).` : false;
            },
        },
    },
    "story.line": {
        fields: {
            name: "char",
            quantity: "integer",
            price: "float",
            subtotal: {
                type: "float",
                depends: ["quantity", "price"],
                compute: (line) => (line.quantity || 0) * (line.price || 0),
            },
        },
        records: LINES,
    },
};

stories.add({
    title: "Sales order",
    folder: "Form",
    description: `A complete form view: status bar, notebook, editable one2many and tags.
        Change a quantity: computed fields update the subtotal and the total. Change the customer:
        an onchange method updates the notes. The calls show in ORM calls.`,
    models: salesModels,
    arch: `<form>
    <header>
        <field name="state" widget="statusbar" options="{'clickable': True}"/>
    </header>
    <sheet>
        <div class="oe_title">
            <h1><field name="name"/></h1>
        </div>
        <group>
            <group>
                <field name="partner_id"/>
                <field name="tag_ids" widget="many2many_tags" options="{'color_field': 'color'}"/>
            </group>
            <group>
                <field name="date_order"/>
                <field name="amount_total"/>
                <field name="currency_id" invisible="1"/>
            </group>
        </group>
        <notebook>
            <page string="Order Lines">
                <field name="line_ids">
                    <list editable="bottom">
                        <field name="name"/>
                        <field name="quantity"/>
                        <field name="price"/>
                        <field name="subtotal" sum="Total"/>
                    </list>
                </field>
            </page>
            <page string="Notes">
                <field name="note"/>
            </page>
        </notebook>
    </sheet>
</form>`,
});

stories.add({
    title: "Editable list",
    folder: "List",
    description: "Click a row to edit it, the totals follow.",
    models: salesModels,
    arch: `<list editable="bottom">
    <field name="name"/>
    <field name="partner_id"/>
    <field name="date_order"/>
    <field name="state" widget="badge"/>
    <field name="amount_total" sum="Total"/>
    <field name="currency_id" column_invisible="1"/>
</list>`,
});

stories.add({
    title: "Grouped list",
    folder: "List",
    models: salesModels,
    groupBy: ["partner_id"],
    arch: `<list>
    <field name="name"/>
    <field name="date_order"/>
    <field name="amount_total" sum="Total"/>
    <field name="currency_id" column_invisible="1"/>
</list>`,
});

stories.add({
    title: "Kanban",
    folder: "Kanban",
    models: salesModels,
    arch: `<kanban>
    <templates>
        <t t-name="card">
            <field name="name" class="fw-bold fs-5"/>
            <field name="partner_id"/>
            <footer>
                <field name="tag_ids" widget="many2many_tags"/>
                <field name="amount_total" class="ms-auto fw-bold"/>
                <field name="currency_id" invisible="1"/>
            </footer>
        </t>
    </templates>
</kanban>`,
});

stories.add({
    title: "Arch only",
    folder: "Form",
    description: `Only an arch is given: the fields and the record are guessed from the field
        names and widgets (<code>partner_id</code> is a many2one, <code>tag_ids</code> a many2many,
        <code>date_deadline</code> a date...).`,
    arch: `<form>
    <sheet>
        <group>
            <field name="name"/>
            <field name="partner_id" widget="many2one_avatar"/>
            <field name="tag_ids" widget="many2many_tags"/>
            <field name="date_deadline"/>
            <field name="is_company"/>
            <field name="priority" widget="priority"/>
        </group>
    </sheet>
</form>`,
});

stories.add({
    title: "Pivot",
    folder: "Pivot",
    description: "Totals by customer and by month. Click the headers to expand or collapse them.",
    models: salesModels,
    arch: `<pivot>
    <field name="partner_id" type="row"/>
    <field name="date_order" interval="month" type="col"/>
    <field name="amount_total" type="measure"/>
</pivot>`,
});

stories.add({
    title: "Bar chart",
    folder: "Graph",
    models: salesModels,
    arch: `<graph type="bar">
    <field name="partner_id"/>
    <field name="amount_total" type="measure"/>
</graph>`,
});

stories.add({
    title: "Line chart",
    folder: "Graph",
    models: salesModels,
    arch: `<graph type="line">
    <field name="date_order" interval="week"/>
    <field name="amount_total" type="measure"/>
</graph>`,
});

stories.add({
    title: "Pie chart",
    folder: "Graph",
    models: salesModels,
    arch: `<graph type="pie">
    <field name="state"/>
</graph>`,
});

stories.add({
    title: "Calendar",
    folder: "Calendar",
    description: "Orders on their date, colored by customer.",
    models: salesModels,
    arch: `<calendar date_start="date_order" mode="month" color="partner_id">
    <field name="partner_id"/>
    <field name="amount_total"/>
</calendar>`,
});
