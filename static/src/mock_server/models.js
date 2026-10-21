/**
 * Turns the models a story gives into complete model definitions, filling in
 * everything that can be guessed so stories stay short:
 *
 *   models: {
 *       "res.partner": {
 *           fields: { name: "char", parent_id: { type: "many2one", relation: "res.partner" } },
 *           records: [{ id: 1, name: "Agrolait", parent_id: false }],
 *       },
 *   }
 *
 * - a field can be given by its type only ("char"), or as a descriptor like
 *   the ones of the web tests helpers (`{ type, relation, selection, ... }`);
 * - fields used by the records but not declared get a type from their value;
 * - `id` and `display_name` always exist, the label of a field is derived from
 *   its name, and records get an id when they have none.
 *
 * A field can be computed, like a Python computed field: `compute` returns its
 * value from the record (x2many fields being lists of records), `depends`
 * lists the fields it reads, dotted for the fields of an x2many:
 *
 *   amount_total: {
 *       type: "monetary",
 *       depends: ["line_ids.quantity", "line_ids.price"],
 *       compute: (order) => order.line_ids.reduce((total, line) => total + line.quantity * line.price, 0),
 *   },
 *
 * Business methods called with `orm.call` are given as `methods`, called with
 * the arguments of the call: `methods: { action_done(args, kwargs, helpers) {} }`.
 *
 * A model can also give onchange methods, called when a field changes in a
 * view. They receive the values of the record, change them in place, and can
 * read other records with `getRecord(model, id)`:
 *
 *   onchange: {
 *       partner_id(record, { getRecord }) {
 *           record.email = getRecord("res.partner", record.partner_id)?.email || false;
 *       },
 *   },
 */

const VALUE_TYPES = {
    boolean: "boolean",
    string: "char",
};

/** Field types the web client accepts, see `validFieldTypes`. */
const FIELD_TYPES = new Set([
    "binary",
    "boolean",
    "char",
    "date",
    "datetime",
    "float",
    "html",
    "integer",
    "json",
    "many2many",
    "many2one",
    "many2one_reference",
    "monetary",
    "one2many",
    "properties",
    "properties_definition",
    "reference",
    "selection",
    "text",
]);

export function humanize(name) {
    const label = name.replace(/_ids?$/, "").replace(/_/g, " ").trim();
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function guessType(value) {
    if (typeof value === "number") {
        return Number.isInteger(value) ? "integer" : "float";
    }
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return "date";
    }
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
        return "datetime";
    }
    return VALUE_TYPES[typeof value] || "json";
}

/**
 * @param {string} name
 * @param {string | Object} definition
 */
export function normalizeField(name, definition) {
    const field = typeof definition === "string" ? { type: definition } : { ...definition };
    if (!FIELD_TYPES.has(field.type)) {
        throw new Error(`Owlybook: field "${name}" has an unknown type "${field.type}"`);
    }
    field.name = name;
    field.string ??= humanize(name);
    if (field.compute) {
        field.readonly ??= true;
    }
    field.readonly ??= false;
    field.required ??= false;
    field.searchable ??= true;
    field.sortable ??= !["one2many", "many2many", "binary", "json"].includes(field.type);
    field.groupable ??= field.sortable;
    field.store ??= true;
    if (field.compute) {
        field.depends ??= [];
    }
    if (["integer", "float", "monetary"].includes(field.type)) {
        field.aggregator ??= "sum";
    }
    if (field.type === "monetary") {
        field.currency_field ??= "currency_id";
    }
    if (field.type === "selection") {
        field.selection ??= [];
    }
    if (field.type === "reference") {
        field.selection ??= [];
    }
    return field;
}

/**
 * @param {Record<string, Object>} models
 * @returns {Record<string, { name: string, fields: Object, records: Object[], recName: string, order: string, views: Object }>}
 */
export function normalizeModels(models) {
    const result = {};
    for (const [name, model] of Object.entries(models)) {
        const fields = {};
        for (const [fieldName, definition] of Object.entries(model.fields || {})) {
            fields[fieldName] = normalizeField(fieldName, definition);
        }
        const records = (model.records || []).map((record) => ({ ...record }));
        let nextId = 1;
        for (const record of records) {
            if (record.id) {
                nextId = Math.max(nextId, record.id + 1);
            }
        }
        for (const record of records) {
            record.id ??= nextId++;
            for (const [fieldName, value] of Object.entries(record)) {
                const isUnknown = fieldName !== "id" && !(fieldName in fields);
                if (isUnknown && value !== false && value !== null) {
                    fields[fieldName] = normalizeField(fieldName, guessType(value));
                }
            }
        }
        fields.id ??= normalizeField("id", { type: "integer", string: "ID", readonly: true });
        fields.display_name ??= normalizeField("display_name", {
            type: "char",
            string: "Display Name",
            readonly: true,
            store: false,
        });
        result[name] = {
            name,
            description: model.description || humanize(name.split(".").at(-1)),
            fields,
            records,
            recName: model.recName || ("name" in fields ? "name" : "display_name"),
            order: model.order || "id",
            views: { ...model.views },
            onchange: { ...model.onchange },
            methods: { ...model.methods },
        };
    }
    return result;
}
