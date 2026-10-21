/**
 * Field widget stories: from a widget key, builds a model with a field the
 * widget supports, a record with a fitting value and a form arch showing it.
 * Every widget of the "fields" and "view_widgets" registries gets such a
 * story, unless a story was written for it.
 */
import { registry } from "@web/core/registry";
import { session } from "@web/session";
import { stories, normalizeStory } from "./story_registry";

const fieldRegistry = registry.category("fields");
const widgetRegistry = registry.category("view_widgets");

export const MAIN_MODEL = "story.record";

/** Types needing data a generated story can't make up. */
const UNSUPPORTED_TYPES = ["properties", "properties_definition"];

/**
 * Widgets made for one specific view or record (the user groups, the
 * settings, the profiling...): a generic story can't render them.
 */
const SKIPPED_WIDGETS = new Set([
    "dashboard_graph",
    "profiling_qweb_view",
    "property_selection",
    "res_config_dev_tool",
    "res_user_group_ids",
    "res_user_group_ids_privilege",
]);

/**
 * A square PNG image with a text on a gradient, as the base64 value of an
 * image field, e.g. the avatar of a fake employee.
 *
 * @param {string} [text]
 * @param {[string, string]} [colors]
 */
export function makeImage(text = "O", colors = ["#71639e", "#017e84"]) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    context.fillStyle = "#fff";
    context.font = `bold ${text.length > 1 ? 100 : 120}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 128, 136);
    return canvas.toDataURL("image/png").split(",")[1];
}

function serializeDate(date, withTime) {
    const pad = (n) => String(n).padStart(2, "0");
    const day = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
    return withTime
        ? `${day} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
        : day;
}

/**
 * The field shown by a widget story for each field type: its name, its
 * definition and the value of the record.
 */
function getSampleField(type, widget) {
    const now = new Date();
    switch (type) {
        case "char":
            return { name: "name", field: { type }, value: "Agrolait" };
        case "text":
            return {
                name: "description",
                field: { type },
                value: "Owlybook renders components in isolation.\nThis text spans two lines.",
            };
        case "html":
            return { name: "body", field: { type }, value: "<p>Hello <b>Owlybook</b> 🦉</p>" };
        case "integer":
            return { name: "quantity", field: { type }, value: 42 };
        case "float":
            return { name: "progress", field: { type }, value: 37.5 };
        case "monetary":
            return { name: "amount", field: { type }, value: 1250.5 };
        case "boolean":
            return { name: "is_done", field: { type }, value: true };
        case "date":
            return { name: "date_deadline", field: { type }, value: serializeDate(now) };
        case "datetime":
            return { name: "date_start", field: { type }, value: serializeDate(now, true) };
        case "selection":
            return {
                name: "state",
                field: {
                    type,
                    selection: [
                        ["0", "Draft"],
                        ["1", "Sent"],
                        ["2", "Confirmed"],
                        ["3", "Done"],
                    ],
                },
                value: "1",
            };
        case "many2one":
            return {
                name: "partner_id",
                field: { type, relation: "res.partner" },
                value: 1,
            };
        case "many2many":
            return { name: "tag_ids", field: { type, relation: "story.tag" }, value: [1, 2, 4] };
        case "one2many":
            return { name: "line_ids", field: { type, relation: "story.line" }, value: [1, 2, 3] };
        case "binary":
            return { name: widget?.includes("image") ? "image" : "file", field: { type }, value: makeImage() };
        case "json":
            return { name: "data", field: { type }, value: { owl: "🦉", stories: 42 } };
        case "reference":
            return {
                name: "reference",
                field: { type, selection: [["res.partner", "Contact"]] },
                value: "res.partner,1",
            };
        case "many2one_reference":
            return {
                name: "res_id",
                field: { type, model_field: "res_model" },
                value: 1,
                extraFields: { res_model: { type: "char" } },
                extraValues: { res_model: "res.partner" },
            };
    }
    return { name: "value", field: { type }, value: false };
}

function getCurrencyRecords() {
    return Object.entries(session.currencies || {}).map(([id, currency]) => ({
        id: Number(id),
        name: currency.name,
        symbol: currency.symbol,
        position: currency.position,
        decimal_places: currency.digits?.[1] ?? 2,
    }));
}

/**
 * Models every generated story can use: contacts, tags, lines, currencies.
 */
export function getSampleModels() {
    const currencies = getCurrencyRecords();
    return {
        "res.partner": {
            fields: {
                name: "char",
                email: "char",
                is_company: "boolean",
                color: "integer",
            },
            records: [
                { id: 1, name: "Agrolait", email: "agrolait@example.com", is_company: true, color: 2 },
                { id: 2, name: "Deco Addict", email: "deco@example.com", is_company: true, color: 4 },
                { id: 3, name: "Gemini Furniture", email: "gemini@example.com", is_company: true, color: 8 },
                { id: 4, name: "Azure Interior", email: "azure@example.com", is_company: true, color: 10 },
                { id: 5, name: "Marc Demo", email: "marc@example.com", is_company: false, color: 1 },
            ],
        },
        "story.tag": {
            fields: { name: "char", color: "integer" },
            records: [
                { id: 1, name: "Urgent", color: 1 },
                { id: 2, name: "Customer", color: 10 },
                { id: 3, name: "Prospect", color: 3 },
                { id: 4, name: "VIP", color: 5 },
            ],
        },
        "story.line": {
            fields: { name: "char", quantity: "integer", price: "float" },
            records: [
                { id: 1, name: "Office chair", quantity: 2, price: 120 },
                { id: 2, name: "Standing desk", quantity: 1, price: 450 },
                { id: 3, name: "Monitor", quantity: 3, price: 210.5 },
            ],
        },
        "res.currency": {
            fields: {
                name: "char",
                symbol: "char",
                position: "char",
                decimal_places: "integer",
            },
            records: currencies,
        },
    };
}

function indent(text) {
    return text
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n");
}

function formatAttributes(attrs) {
    return Object.entries(attrs || {})
        .map(([name, value]) => ` ${name}="${String(value).replace(/"/g, "&quot;")}"`)
        .join("");
}

function formatOptions(options) {
    if (!options || !Object.keys(options).length) {
        return "";
    }
    const json = JSON.stringify(options)
        .replace(/\btrue\b/g, "True")
        .replace(/\bfalse\b/g, "False")
        .replace(/\bnull\b/g, "None");
    return ` options="${json.replace(/"/g, "'")}"`;
}

/**
 * Completes a widget story (`{ widget: "many2one_avatar" }`) with the models,
 * the record and the arch it needs.
 *
 * @returns {{ arch: string, models: Object, resModel: string, resId: number }}
 */
export function buildWidgetStory(story) {
    const models = { ...getSampleModels(), ...story.models };
    const fieldEntry = fieldRegistry.get(story.widget, null);
    const nodeAttrs = formatAttributes(story.attrs) + formatOptions(story.options);
    let lines;
    const record = { id: 1 };
    const fields = {};
    if (fieldEntry) {
        const type = story.fieldType || fieldEntry.supportedTypes?.[0] || "char";
        const sample = getSampleField(type, story.widget);
        fields[sample.name] = sample.field;
        record[sample.name] = "value" in story ? story.value : sample.value;
        Object.assign(fields, sample.extraFields);
        Object.assign(record, sample.extraValues);
        let fieldNode = `<field name="${sample.name}" widget="${story.widget}"${nodeAttrs}/>`;
        if (type === "one2many") {
            fieldNode = [
                `<field name="${sample.name}" widget="${story.widget}"${nodeAttrs}>`,
                `    <list editable="bottom">`,
                `        <field name="name"/>`,
                `        <field name="quantity"/>`,
                `        <field name="price"/>`,
                `    </list>`,
                `</field>`,
            ].join("\n");
        }
        if (type === "monetary") {
            fields.currency_id = { type: "many2one", relation: "res.currency" };
            record.currency_id = models["res.currency"].records[0]?.id || false;
        }
        fields.name ??= { type: "char" };
        record.name ??= "Agrolait";
        // Fields the widget reads without showing them must be in the view.
        const hiddenFields = Object.keys(fields).filter((name) => ["currency_id", "res_model"].includes(name));
        const hiddenNodes = hiddenFields.map((name) => `<field name="${name}" invisible="1"/>`);
        if (story.widget === "statusbar") {
            lines = [
                "<header>",
                indent(fieldNode),
                "</header>",
                "<sheet>",
                indent(["<group>", indent('<field name="name"/>'), "</group>", ...hiddenNodes].join("\n")),
                "</sheet>",
            ];
        } else {
            lines = [
                "<sheet>",
                indent(["<group>", indent(fieldNode), "</group>", ...hiddenNodes].join("\n")),
                "</sheet>",
            ];
        }
    } else {
        fields.name = { type: "char" };
        record.name = "Agrolait";
        lines = [
            "<sheet>",
            indent(`<widget name="${story.widget}"${nodeAttrs}/>`),
            indent(["<group>", indent('<field name="name"/>'), "</group>"].join("\n")),
            "</sheet>",
        ];
    }
    models[MAIN_MODEL] = {
        fields: { ...fields, ...models[MAIN_MODEL]?.fields },
        records: models[MAIN_MODEL]?.records || [record],
    };
    return {
        arch: story.arch || ["<form>", indent(lines.join("\n")), "</form>"].join("\n"),
        models,
        resModel: MAIN_MODEL,
        resId: 1,
    };
}

function describeEntry(key, entry, kind) {
    const types = entry.supportedTypes?.length ? ` Supports ${entry.supportedTypes.join(", ")} fields.` : "";
    const name = entry.displayName ? `<b>${entry.displayName}</b>: the ` : "The ";
    return `${name}<code>${key}</code> ${kind}, generated from its registry entry.${types}`;
}

/**
 * Adds a story for every field widget and view widget that doesn't have one.
 */
export function addWidgetStories() {
    const sources = [
        [fieldRegistry, "Fields", "field widget"],
        [widgetRegistry, "Widgets", "view widget"],
    ];
    // Widgets with a written story, whatever addon it was written in.
    const written = new Set(
        stories
            .getAll()
            .filter((story) => ["Fields", "Widgets"].includes(story.folder))
            .map((story) => story.widget || story.title)
    );
    for (const [widgetSource, folder, kind] of sources) {
        for (const [key, entry] of widgetSource.getEntries()) {
            if (key.includes(".") || !entry.component || SKIPPED_WIDGETS.has(key) || written.has(key)) {
                continue;
            }
            if (entry.supportedTypes?.every((type) => UNSUPPORTED_TYPES.includes(type))) {
                continue;
            }
            const definition = {
                widget: key,
                folder,
                description: describeEntry(key, entry, kind),
                generated: true,
            };
            if (!stories.has(normalizeStory(definition).id)) {
                stories.add(definition);
            }
        }
    }
}

/**
 * The usual Odoo naming conventions say a lot about the type of a field.
 */
function guessTypeFromName(name) {
    if (name.endsWith("_ids")) {
        return "many2many";
    }
    if (name.endsWith("_id")) {
        return "many2one";
    }
    if (name.startsWith("date")) {
        return name.includes("time") ? "datetime" : "date";
    }
    if (/^(is|has|can)_/.test(name)) {
        return "boolean";
    }
    if (/(amount|price|total)/.test(name)) {
        return "float";
    }
    return "char";
}

/**
 * Lets a view story give an arch only: the fields of the main model it uses
 * and doesn't define are added, typed after their widget, and the model gets
 * a record when it has none.
 *
 * @param {string} arch
 * @param {Record<string, Object>} models as given by the story
 * @param {string} resModel
 * @returns {Record<string, Object>} the completed models
 */
export function completeModelsFromArch(arch, models, resModel) {
    const result = { ...getSampleModels(), ...models };
    const model = { fields: {}, ...result[resModel] };
    model.fields = { ...model.fields };
    const root = new DOMParser().parseFromString(arch, "text/xml").documentElement;
    const generatedRecord = { id: 1 };
    // Only the fields of the main model: nested x2many nodes describe a comodel.
    const isNested = (node) => node.parentElement.closest("field");
    for (const node of root.querySelectorAll("field[name]")) {
        const name = node.getAttribute("name");
        if (isNested(node) || name in model.fields || ["id", "display_name"].includes(name)) {
            continue;
        }
        const widget = node.getAttribute("widget");
        const type = fieldRegistry.get(widget, null)?.supportedTypes?.[0] || guessTypeFromName(name);
        const sample = getSampleField(type, widget);
        model.fields[name] = sample.field;
        generatedRecord[name] = sample.value;
        Object.assign(model.fields, sample.extraFields);
        Object.assign(generatedRecord, sample.extraValues);
    }
    if (!model.records?.length) {
        model.records = [generatedRecord];
    }
    result[resModel] = model;
    return result;
}
