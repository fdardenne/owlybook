<h1 align="center">🦉 <a href="https://github.com/fdardenne/owlybook">Owlybook</a> 🦉</h1>

Owlybook renders Odoo UI components and views in isolation, as stories, in the
spirit of [Storybook](https://storybook.js.org/). Each story comes with:

- live controls, built from the props the component declares with `useProps`,
  or from the attributes and options a field widget declares in its registry;
- a log of the callbacks the component calls, or of the ORM calls the view makes;
- the code to reuse it: import, template call with the current props, template
  and class source, or the arch of a view;
- an export to a single HTML file that works without any Odoo server.

It targets Odoo 20 (Owl 3).

## Install

Add the folder containing `owlybook` to the addons path, install the module and
open `/owlybook` (or the Owlybook app in the menu).

### Choose the addons shown

Every installed addon shows its stories. To keep some only, set the
`owlybook.addons` system parameter (Settings > Technical > System Parameters)
to a comma separated list, `*` matching anything: `web,hr,hr_*`. Exports
follow it too.

## Write a story

Stories go in the `owlybook.stories` bundle. In the manifest of your addon:

```python
'assets': {
    'owlybook.stories': [
        'my_addon/static/stories/**/*',
    ],
},
```

A story only says what Owlybook can't read from the code.

### Components

```js
import { stories } from "@owlybook/story/story_registry";
import { CheckBox } from "@web/core/checkbox/checkbox";

stories.add({ component: CheckBox });
```

That is enough: the addon, the folder, the import statement and the template
are found by looking at the module exporting the component, and each prop gets
a control from the schema given to `useProps` (`t.boolean()` is a switch,
`t.selection([...])` a select, and so on). Callback props are replaced by
functions logging their calls in the Events tab, and required props without a
value get one of their type, so the story renders right away.

Give more only when needed:

```js
stories.add({
    component: CheckBox,
    title: "Switch",                      // defaults to the component name
    description: "A <b>switch</b> style checkbox.",
    props: { value: true, className: "form-switch" },
    // the props the component receives, under a template, e.g. to fill slots
    template: `<CheckBox t-props="this.props">Receive the newsletter</CheckBox>`,
    // keep a prop in sync with a callback: onChange(value) sets `value`
    sync: { onChange: "value" },
    // refine the inferred controls
    controls: { className: { choices: ["", "form-switch"], help: "Bootstrap class" } },
});
```

Dialogs are opened with the dialog service, as the code using them does, and
opened again when a prop changes:

```js
stories.add({ component: ConfirmationDialog, dialog: true, props: { body: "Delete this record?" } });
```

A function given in `props` is still logged, and is called with `this` bound to
the current props, so it can update them:

```js
stories.add({
    component: Pager,
    props: {
        offset: 0, limit: 80, total: 412,
        onUpdate({ offset, limit }) {
            this.offset = offset;
            this.limit = limit;
        },
    },
});
```

### Field widgets

Every widget of the `fields` and `view_widgets` registries already has a
generated story: a model with a field the widget supports, a record with a
fitting value, and a form showing it. The controls list the attributes and
options of the widget, read from `supportedAttributes`, `supportedOptions` and
from what its `extractProps` function reads. A story replaces the generated one
to give it better data:

```js
stories.add({ widget: "statusbar", options: { clickable: true } });
stories.add({ widget: "web_ribbon", attrs: { title: "Archived", bg_color: "text-bg-danger" } });
stories.add({ widget: "many2one_avatar", value: 3, fieldType: "many2one" });
```

### Views

```js
stories.add({
    title: "Contact",
    arch: `<form>
        <field name="name"/>
        <field name="partner_id" widget="many2one_avatar"/>
        <field name="tag_ids" widget="many2many_tags"/>
        <field name="date_deadline"/>
    </form>`,
});
```

The model, its fields and a record are guessed from the arch: the widget gives
the type of a field, and so do the usual names (`*_id` is a many2one,
`*_ids` a many2many, `date*` a date, `is_*` a boolean). Contacts, tags, order
lines and currencies are always available to relational fields. Describe the
data yourself when it matters:

```js
stories.add({
    title: "Sales orders",
    folder: "List",
    arch: `<list editable="bottom">...</list>`,
    models: {
        "sale.order": {
            fields: {
                name: "char",                        // a type is enough
                partner_id: { type: "many2one", relation: "res.partner" },
                state: { type: "selection", selection: [["draft", "Quotation"], ["sale", "Sales Order"]] },
            },
            // fields used here but not declared get a type from their value
            records: [{ id: 1, name: "S00042", partner_id: 2, state: "draft", amount: 120.5 }],
        },
    },
    groupBy: ["partner_id"],                         // optional
    domain: [["state", "=", "draft"]],               // optional, the records a list or kanban shows
    resId: 1,                                        // form views: defaults to the first record
    searchArch: `<search>...</search>`,              // defaults to one built from the fields
});
```

Views show their control panel (buttons, search, pager); a switch in the toolbar
hides it. The arch and the search view can be edited in the Arch tab.

Fields can be computed, like Python computed fields, and a model can have
onchange methods. As the server does, the arch gets `on_change="1"` on the
fields they depend on (and on the name, which `display_name` depends on), so
editing them calls `onchange`, which returns what changed:

```js
"sale.order": {
    fields: {
        line_ids: { type: "one2many", relation: "sale.order.line" },
        amount_total: {
            type: "monetary",
            depends: ["line_ids.subtotal"],   // dotted: fields of the lines
            compute: (order) => order.line_ids.reduce((total, line) => total + line.subtotal, 0),
        },
    },
},
```

`compute` receives the record with its x2many fields as lists of records, and
stored values are recomputed on save.

```js
models: {
    "sale.order": {
        fields: { ... },
        records: [ ... ],
        onchange: {                      // onchange methods
            partner_id(order, { getRecord }) {
                const partner = getRecord("res.partner", order.partner_id);
                order.note = partner ? `Quotation for ${partner.name}` : false;
            },
        },
    },
},
```

Every view type is supported: form, list, kanban, calendar, pivot, graph,
hierarchy, and the custom views of the apps (`js_class`).

The views talk to an in-memory database answering the ORM calls of the web
client (`web_read`, `web_search_read`, `web_save`, `onchange`, `web_read_group`,
name search, `get_views`...): records can be created, edited and deleted, and
every call shows in the ORM calls tab. Set `liveData: true` on a story to send
its calls to the real server instead (it then can't be exported).

Apps often call business methods and controllers of their own: a model can
give its `methods`, and a story the `routes` it answers:

```js
models: {
    "hr.department": {
        fields: { ... },
        methods: {
            get_department_hierarchy([id], kwargs, { getRecord, search }) { ... },
        },
    },
},
routes: {
    "/hr/get_org_chart": ({ employee_id }, { getRecord, search }) => ({ ... }),
},
```

### Stories of an app

Stories importing an app (`@hr/...`) can't be in the app-agnostic bundle of a
module that doesn't depend on it. Put them in a small bridge module,
installed automatically with both:

```python
{
    'name': "Owlybook HR",
    'depends': ['owlybook', 'hr'],
    'auto_install': True,
    'assets': {'owlybook.stories': ['owlybook_hr/static/src/**/*']},
}
```

`owlybook_hr` is an example: the field widgets, view widgets, views and
dialogs of hr, on a fake company with its departments, employees and contracts.

A bridge can build on another one: `owlybook_hr_payroll` depends on
`owlybook_hr` and `hr_payroll`, and adds pay runs, payslips with their lines,
worked days and inputs, salary rules and payslip adjustments to the HR data
(`getHrModels()` from `@owlybook_hr/hr_data`).

## Export

From the Export menu of a story, or the welcome page:

- **a story**, as currently configured, optionally with its controls;
- **the whole Owlybook**, every story with the sidebar and the panel, to publish
  as a static site (it is downloaded as `index.html`: drop it in a GitHub
  Pages repository).

The compiled assets, the fonts, the translations and a neutral session are
inlined, and the data comes from the in-memory database: the file opens from
the disk, or from any static host, without an Odoo server. The assets are
gzipped then base64 encoded and inflated by the page when it loads, which makes
the files about four times smaller (1.5 to 3 MB, depending on the installed
apps).

## Tests

- `owlybook/tests`: renders every story in a browser, and checks an exported
  story renders without loading anything.
- `owlybook/static/tests`: unit tests of the props schema reader, the arch
  controls and the in-memory database, run with the web unit tests (hoot).

## Credits

- Inspired by [Storybook](https://storybook.js.org/), for Owl and Odoo
- The Odoo JavaScript framework team
