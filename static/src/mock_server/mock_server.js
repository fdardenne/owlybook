/**
 * A small in-memory ORM answering the calls the web client makes, so view
 * stories render real views with fake data, with or without an Odoo server.
 *
 * It follows the formats of the server (and of the mock server of the web
 * tests) for the methods views use. Anything else is answered with `false`
 * and reported in the console, so a story can still render.
 */
import { Domain } from "@web/core/domain";
import { deepCopy } from "@web/core/utils/objects";
import { normalizeModels } from "./models";

const X2MANY_TYPES = ["one2many", "many2many"];

/** Labels of the date groups, like the server's. */
const DATE_PERIOD_LABELS = {
    hour: "HH:00 dd MMM",
    day: "dd MMM yyyy",
    week: "'W'WW kkkk",
    month: "MMMM yyyy",
    quarter: "'Q'q yyyy",
    year: "yyyy",
};

/** Date groupings by number ("date:month_number"). */
const DATE_NUMBERS = {
    year_number: (date) => date.year,
    quarter_number: (date) => date.quarter,
    month_number: (date) => date.month,
    iso_week_number: (date) => date.weekNumber,
    day_of_year: (date) => date.ordinal,
    day_of_month: (date) => date.day,
    day_of_week: (date) => date.weekday % 7,
    hour_number: (date) => date.hour,
};

/** Values of a field when a record doesn't give one. */
const EMPTY_VALUES = {
    boolean: () => false,
    integer: () => 0,
    float: () => 0,
    monetary: () => 0,
    many2many: () => [],
    one2many: () => [],
    json: () => false,
    properties: () => [],
    properties_definition: () => [],
};

/** Commands of x2many values, see `x2ManyCommands` in the orm plugin. */
const Command = { CREATE: 0, UPDATE: 1, DELETE: 2, UNLINK: 3, LINK: 4, CLEAR: 5, SET: 6 };

/**
 * Copies plain data, keeping functions (compute and onchange methods) as is.
 */
function copyData(value) {
    if (Array.isArray(value)) {
        return value.map(copyData);
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, copyData(item)]));
    }
    return value;
}

/**
 * Reads method arguments the way Python does: positionally from `args`, then
 * by name from `kwargs`.
 */
function getArgs(args, kwargs, names) {
    const result = { context: kwargs.context || {} };
    names.forEach((name, index) => {
        result[name] = index < args.length ? args[index] : kwargs[name];
    });
    return result;
}

function compareValues(a, b) {
    if (a === b) {
        return 0;
    }
    if (a === false || a === undefined || a === null) {
        return -1;
    }
    if (b === false || b === undefined || b === null) {
        return 1;
    }
    return a < b ? -1 : 1;
}

export class MockServer {
    /**
     * @param {Record<string, any>} models see `normalizeModels`
     * @param {Object} [options]
     * @param {(call: { model: string, method: string, args: any[], kwargs: Object }) => void} [options.onCall]
     *   called for each ORM call, before it is answered
     * @param {Record<string, (params: Object, helpers: Object) => any>} [options.routes]
     *   answers of the routes that are not ORM calls, e.g. controllers
     */
    constructor(models = {}, { onCall, routes = {} } = {}) {
        this.onCall = onCall;
        this.routes = routes;
        // Copied so the story can be reset.
        this.models = normalizeModels(copyData(models));
        this.onchangeTriggers = this.getOnchangeTriggers();
        // Twice: the computes of a record can read the ones of its lines.
        for (let pass = 0; pass < 2; pass++) {
            for (const model of Object.values(this.models)) {
                for (const record of model.records) {
                    this.recompute(model, record);
                }
            }
        }
        this.nextId = 1 + Math.max(
            0,
            ...Object.values(this.models).flatMap((model) => model.records.map((r) => r.id))
        );
    }

    // -------------------------------------------------------------------------
    // Entry points
    // -------------------------------------------------------------------------

    /**
     * @param {string} route
     * @param {Object} params
     * @returns {{ result: any } | null} `null` when the route isn't handled
     */
    handleRoute(route, params = {}) {
        if (route in this.routes) {
            return { result: this.routes[route](params, this.getHelpers()) };
        }
        if (route.startsWith("/web/dataset/call_kw") || route === "/web/dataset/call_button") {
            const { model, method, args = [], kwargs = {} } = params;
            return { result: this.callKw(model, method, args, kwargs) };
        }
        if (route === "/web/action/load") {
            return { result: false };
        }
        return null;
    }

    callKw(modelName, method, args, kwargs) {
        this.onCall?.({ model: modelName, method, args, kwargs });
        if (!(modelName in this.models)) {
            return this.handleUnknownCall(modelName, method, args, kwargs);
        }
        const modelMethod = this.models[modelName].methods[method];
        if (modelMethod) {
            return modelMethod(args, kwargs, this.getHelpers());
        }
        const handler = this[`rpc_${method}`];
        if (!handler) {
            return this.handleUnknownCall(modelName, method, args, kwargs);
        }
        return handler.call(this, this.models[modelName], args, kwargs);
    }

    handleUnknownCall(modelName, method, args, kwargs) {
        if (modelName === "ir.model" && method === "display_name_for") {
            const { models = [] } = getArgs(args, kwargs, ["models"]);
            return models.map((model) => ({ model, display_name: this.models[model]?.description || model }));
        }
        if (method === "has_group" || method === "has_access" || method === "check_access_rights") {
            return true;
        }
        console.warn(`[Owlybook] Mock server: "${modelName}.${method}" is not supported`);
        return false;
    }

    // -------------------------------------------------------------------------
    // Records
    // -------------------------------------------------------------------------

    getRecord(model, id) {
        return model.records.find((record) => record.id === id);
    }

    getValue(model, record, fieldName) {
        if (fieldName === "display_name") {
            return this.getDisplayName(model, record);
        }
        if (fieldName in record) {
            return record[fieldName];
        }
        const field = model.fields[fieldName];
        return field && field.type in EMPTY_VALUES ? EMPTY_VALUES[field.type]() : false;
    }

    getDisplayName(model, record) {
        if (record.display_name) {
            return record.display_name;
        }
        const name = record[model.recName];
        return name || `${model.name},${record.id}`;
    }

    search(model, domain = [], { order, offset = 0, limit } = {}) {
        let records = this.filter(model, domain);
        records = this.sort(model, records, order || model.order);
        const length = records.length;
        records = records.slice(offset, limit ? offset + limit : undefined);
        return { length, records };
    }

    filter(model, domain) {
        const activeField = "active" in model.fields;
        const domainObject = new Domain(domain || []);
        const isActiveInDomain = domainObject.toString().includes('"active"');
        return model.records.filter((record) => {
            if (activeField && !isActiveInDomain && this.getValue(model, record, "active") === false) {
                return false;
            }
            const values = {};
            for (const fieldName in model.fields) {
                values[fieldName] = this.getValue(model, record, fieldName);
            }
            try {
                return domainObject.contains(values);
            } catch {
                // Domains on related paths ("partner_id.name") aren't supported.
                return true;
            }
        });
    }

    sort(model, records, order) {
        const terms = (order || "id")
            .split(",")
            .map((term) => term.trim().split(/\s+/))
            .filter(([fieldName]) => fieldName);
        return [...records].sort((a, b) => {
            for (const [fieldName, direction] of terms) {
                let valueA = this.getValue(model, a, fieldName);
                let valueB = this.getValue(model, b, fieldName);
                if (model.fields[fieldName]?.type === "many2one") {
                    const comodel = this.models[model.fields[fieldName].relation];
                    valueA = valueA && this.getDisplayName(comodel, this.getRecord(comodel, valueA) || {});
                    valueB = valueB && this.getDisplayName(comodel, this.getRecord(comodel, valueB) || {});
                }
                const result = compareValues(valueA, valueB);
                if (result) {
                    return direction?.toLowerCase() === "desc" ? -result : result;
                }
            }
            return 0;
        });
    }

    /**
     * Formats records like `web_read` does, following a specification such as
     * `{ name: {}, partner_id: { fields: { display_name: {} } } }`.
     */
    readRecords(model, records, specification) {
        return records.map((record) => {
            const result = { id: record.id };
            for (const [fieldName, fieldSpec] of Object.entries(specification || {})) {
                result[fieldName] = this.readField(model, record, fieldName, fieldSpec || {});
            }
            return result;
        });
    }

    readField(model, record, fieldName, fieldSpec) {
        const field = model.fields[fieldName];
        const value = this.getValue(model, record, fieldName);
        if (!field) {
            return value;
        }
        const subFields = fieldSpec.fields;
        switch (field.type) {
            case "many2one": {
                const comodel = this.models[field.relation];
                const related = value && comodel && this.getRecord(comodel, value);
                if (!related) {
                    return false;
                }
                return subFields ? this.readRecords(comodel, [related], subFields)[0] : value;
            }
            case "one2many":
            case "many2many": {
                const comodel = this.models[field.relation];
                if (!comodel || !subFields || !Object.keys(subFields).length) {
                    return value;
                }
                let related = value.map((id) => this.getRecord(comodel, id)).filter(Boolean);
                if (fieldSpec.order) {
                    related = this.sort(comodel, related, fieldSpec.order);
                }
                return related.map((relatedRecord, index) =>
                    fieldSpec.limit && index >= fieldSpec.limit
                        ? { id: relatedRecord.id }
                        : this.readRecords(comodel, [relatedRecord], subFields)[0]
                );
            }
            case "reference": {
                if (!value) {
                    return false;
                }
                const [comodelName, id] = value.split(",");
                const comodel = this.models[comodelName];
                const related = comodel && this.getRecord(comodel, Number(id));
                if (!related) {
                    return false;
                }
                const result = subFields ? this.readRecords(comodel, [related], subFields)[0] : {};
                return { ...result, id: { id: Number(id), model: comodelName } };
            }
        }
        return value;
    }

    /**
     * Applies values as sent by `web_save` or `onchange`: relational fields
     * come as ids or as lists of commands.
     */
    writeValues(model, record, values) {
        for (const [fieldName, value] of Object.entries(values)) {
            const field = model.fields[fieldName];
            if (!field) {
                continue;
            }
            if (X2MANY_TYPES.includes(field.type)) {
                record[fieldName] = this.applyCommands(field, this.getValue(model, record, fieldName), value);
            } else if (field.type === "many2one" && value && typeof value === "object") {
                record[fieldName] = value.id;
            } else {
                record[fieldName] = value;
            }
        }
        this.recompute(model, record);
    }

    applyCommands(field, ids, commands) {
        const comodel = this.models[field.relation];
        let result = [...ids];
        for (const command of commands || []) {
            if (typeof command === "number") {
                result.push(command);
                continue;
            }
            const [code, id, values] = command;
            switch (code) {
                case Command.CREATE: {
                    const newRecord = { id: this.nextId++ };
                    comodel.records.push(newRecord);
                    this.writeValues(comodel, newRecord, values || {});
                    result.push(newRecord.id);
                    break;
                }
                case Command.UPDATE:
                    this.writeValues(comodel, this.getRecord(comodel, id), values || {});
                    break;
                case Command.DELETE:
                    comodel.records = comodel.records.filter((r) => r.id !== id);
                    result = result.filter((resId) => resId !== id);
                    break;
                case Command.UNLINK:
                    result = result.filter((resId) => resId !== id);
                    break;
                case Command.LINK:
                    if (!result.includes(id)) {
                        result.push(id);
                    }
                    break;
                case Command.CLEAR:
                    result = [];
                    break;
                case Command.SET:
                    result = [...values];
                    break;
            }
        }
        return result;
    }

    /**
     * What compute, onchange and model methods and routes can use to read
     * the database.
     */
    getHelpers() {
        return {
            getRecord: (modelName, id) => this.models[modelName] && this.getRecord(this.models[modelName], id),
            search: (modelName, domain = []) => (this.models[modelName] ? this.filter(this.models[modelName], domain) : []),
        };
    }

    /**
     * The records of an x2many value after the commands of the client, as
     * copies: an onchange changes nothing in the database.
     */
    applyCommandsToCopies(field, ids, commands) {
        const comodel = this.models[field.relation];
        let records = ids.map((id) => ({ ...this.getRecord(comodel, id) }));
        for (const command of commands || []) {
            const [code, id, values] = typeof command === "number" ? [Command.LINK, command] : command;
            switch (code) {
                case Command.CREATE:
                    records.push({ id: 0, ...values });
                    break;
                case Command.UPDATE:
                    records = records.map((record) => (record.id === id ? { ...record, ...values } : record));
                    break;
                case Command.DELETE:
                case Command.UNLINK:
                    records = records.filter((record) => record.id !== id);
                    break;
                case Command.LINK:
                    if (!records.some((record) => record.id === id)) {
                        records.push({ ...this.getRecord(comodel, id), ...values });
                    }
                    break;
                case Command.CLEAR:
                    records = [];
                    break;
                case Command.SET:
                    records = values.map((resId) => ({ ...this.getRecord(comodel, resId) }));
                    break;
            }
        }
        for (const record of records) {
            this.recompute(comodel, record);
        }
        return records;
    }

    /**
     * Sets the computed fields of a record. They read the record with its
     * x2many fields as lists of records: `x2manyRecords` gives the ones an
     * onchange is working on, the others are read from the database.
     */
    recompute(model, record, x2manyRecords = {}) {
        const computedFields = Object.values(model.fields).filter((field) => field.compute);
        if (!computedFields.length) {
            return;
        }
        const values = { ...record };
        for (const field of Object.values(model.fields)) {
            if (X2MANY_TYPES.includes(field.type)) {
                values[field.name] = x2manyRecords[field.name] || this.getValue(model, record, field.name)
                    .map((id) => this.getRecord(this.models[field.relation], id))
                    .filter(Boolean);
            }
        }
        const helpers = this.getHelpers();
        for (const field of computedFields) {
            record[field.name] = values[field.name] = field.compute(values, helpers);
        }
    }

    /**
     * The fields for which the client must call `onchange`, by model: the
     * fields having an onchange method, the fields computes depend on, and the
     * name of the record, which `display_name` depends on.
     *
     * @returns {Map<string, Set<string>>}
     */
    getOnchangeTriggers() {
        const triggers = new Map(Object.keys(this.models).map((name) => [name, new Set()]));
        for (const model of Object.values(this.models)) {
            for (const fieldName of Object.keys(model.onchange)) {
                triggers.get(model.name).add(fieldName);
            }
            if (model.recName !== "display_name") {
                triggers.get(model.name).add(model.recName);
            }
            for (const field of Object.values(model.fields)) {
                for (const path of field.depends || []) {
                    // "line_ids.quantity": line_ids here, quantity on the lines
                    let current = model;
                    for (const fieldName of path.split(".")) {
                        if (!current) {
                            break;
                        }
                        triggers.get(current.name).add(fieldName);
                        current = this.models[current.fields[fieldName]?.relation];
                    }
                }
            }
        }
        return triggers;
    }

    createRecord(model, values) {
        const record = { id: this.nextId++ };
        for (const [fieldName, field] of Object.entries(model.fields)) {
            if ("default" in field) {
                record[fieldName] = deepCopy(field.default);
            }
        }
        model.records.push(record);
        this.writeValues(model, record, values);
        return record;
    }

    // -------------------------------------------------------------------------
    // ORM methods
    // -------------------------------------------------------------------------

    rpc_web_read(model, args, kwargs) {
        const { ids, specification } = getArgs(args, kwargs, ["ids", "specification"]);
        const records = ids.map((id) => this.getRecord(model, id)).filter(Boolean);
        return this.readRecords(model, records, specification);
    }

    rpc_web_search_read(model, args, kwargs) {
        const params = getArgs(args, kwargs, [
            "domain",
            "specification",
            "offset",
            "limit",
            "order",
            "count_limit",
        ]);
        const { length, records } = this.search(model, params.domain, params);
        return {
            length: params.count_limit ? Math.min(length, params.count_limit) : length,
            records: this.readRecords(model, records, params.specification),
        };
    }

    rpc_web_save(model, args, kwargs) {
        const { ids, vals, specification } = getArgs(args, kwargs, ["ids", "vals", "specification"]);
        let records;
        if (ids.length) {
            records = ids.map((id) => this.getRecord(model, id));
            for (const record of records) {
                this.writeValues(model, record, vals);
            }
        } else {
            records = [this.createRecord(model, vals)];
        }
        return this.readRecords(model, records, specification);
    }

    rpc_web_save_multi(model, args, kwargs) {
        const { ids, values, specification } = getArgs(args, kwargs, ["ids", "values", "specification"]);
        return ids.flatMap((id, index) =>
            this.rpc_web_save(model, [[id], values[index], specification], {})
        );
    }

    rpc_onchange(model, args, kwargs) {
        const { ids, values, field_names, fields_spec } = getArgs(args, kwargs, [
            "ids",
            "values",
            "field_names",
            "fields_spec",
        ]);
        const fieldNames = [field_names || []].flat();
        const stored = ids?.[0] && this.getRecord(model, ids[0]);
        const record = stored ? { ...stored } : { id: 0 };
        if (!stored && !fieldNames.length) {
            // A new record: the default values of every field of the view.
            for (const fieldName of Object.keys(fields_spec)) {
                const field = model.fields[fieldName];
                const contextDefault = kwargs.context?.[`default_${fieldName}`];
                if (contextDefault !== undefined) {
                    record[fieldName] = contextDefault;
                } else if (field && "default" in field) {
                    record[fieldName] = deepCopy(field.default);
                }
            }
            Object.assign(record, values);
            this.recompute(model, record);
            return { value: this.formatOnchangeValues(model, record, fields_spec) };
        }
        // The client sends the values it changed: apply them, run the onchange
        // methods of the changed fields and the computes, then return what the
        // server changed.
        const x2manyRecords = {};
        for (const [fieldName, value] of Object.entries(values || {})) {
            const field = model.fields[fieldName];
            if (!field) {
                continue;
            }
            if (X2MANY_TYPES.includes(field.type)) {
                x2manyRecords[fieldName] = this.applyCommandsToCopies(field, this.getValue(model, record, fieldName), value);
            } else {
                record[fieldName] = field.type === "many2one" && value && typeof value === "object" ? value.id : value;
            }
        }
        const [before] = this.readRecords(model, [record], fields_spec);
        const helpers = this.getHelpers();
        for (const fieldName of fieldNames) {
            model.onchange[fieldName]?.(record, helpers);
        }
        this.recompute(model, record, x2manyRecords);
        const [after] = this.readRecords(model, [record], fields_spec);
        const changedSpec = {};
        for (const fieldName of Object.keys(fields_spec)) {
            if (JSON.stringify(before[fieldName]) !== JSON.stringify(after[fieldName])) {
                changedSpec[fieldName] = fields_spec[fieldName];
            }
        }
        return { value: this.formatOnchangeValues(model, record, changedSpec) };
    }

    /**
     * Formats values like `web_read`, x2many values being commands.
     */
    formatOnchangeValues(model, record, specification) {
        const [result] = this.readRecords(model, [record], specification);
        delete result.id;
        for (const [fieldName, value] of Object.entries(result)) {
            const field = model.fields[fieldName];
            if (field && X2MANY_TYPES.includes(field.type)) {
                result[fieldName] = (value || []).map((related) =>
                    typeof related === "object"
                        ? [Command.LINK, related.id, related]
                        : [Command.LINK, related, {}]
                );
            }
        }
        return result;
    }

    rpc_read(model, args, kwargs) {
        const { ids, fields } = getArgs(args, kwargs, ["ids", "fields"]);
        const fieldNames = fields?.length ? fields : Object.keys(model.fields);
        return ids
            .map((id) => this.getRecord(model, id))
            .filter(Boolean)
            .map((record) => {
                const result = { id: record.id };
                for (const fieldName of fieldNames) {
                    const value = this.getValue(model, record, fieldName);
                    const field = model.fields[fieldName];
                    if (field?.type === "many2one" && value) {
                        const comodel = this.models[field.relation];
                        const related = comodel && this.getRecord(comodel, value);
                        result[fieldName] = related ? [value, this.getDisplayName(comodel, related)] : false;
                    } else {
                        result[fieldName] = value;
                    }
                }
                return result;
            });
    }

    rpc_search_read(model, args, kwargs) {
        const params = getArgs(args, kwargs, ["domain", "fields", "offset", "limit", "order"]);
        const { records } = this.search(model, params.domain, params);
        return this.rpc_read(model, [records.map((r) => r.id), params.fields], {});
    }

    rpc_search(model, args, kwargs) {
        const params = getArgs(args, kwargs, ["domain", "offset", "limit", "order"]);
        return this.search(model, params.domain, params).records.map((r) => r.id);
    }

    rpc_search_count(model, args, kwargs) {
        const { domain } = getArgs(args, kwargs, ["domain"]);
        return this.filter(model, domain).length;
    }

    rpc_create(model, args, kwargs) {
        const { vals_list } = getArgs(args, kwargs, ["vals_list"]);
        const ids = [vals_list].flat().map((values) => this.createRecord(model, values).id);
        return Array.isArray(vals_list) ? ids : ids[0];
    }

    rpc_write(model, args, kwargs) {
        const { ids, vals } = getArgs(args, kwargs, ["ids", "vals"]);
        for (const id of ids) {
            this.writeValues(model, this.getRecord(model, id), vals);
        }
        return true;
    }

    rpc_unlink(model, args, kwargs) {
        const { ids } = getArgs(args, kwargs, ["ids"]);
        model.records = model.records.filter((record) => !ids.includes(record.id));
        return true;
    }

    rpc_web_unlink(model, args, kwargs) {
        return this.rpc_unlink(model, args, kwargs);
    }

    rpc_action_archive(model, args, kwargs) {
        return this.rpc_write(model, [getArgs(args, kwargs, ["ids"]).ids, { active: false }], {});
    }

    rpc_action_unarchive(model, args, kwargs) {
        return this.rpc_write(model, [getArgs(args, kwargs, ["ids"]).ids, { active: true }], {});
    }

    rpc_copy(model, args, kwargs) {
        const { ids } = getArgs(args, kwargs, ["ids"]);
        return ids.map((id) => {
            const { id: _id, ...values } = deepCopy(this.getRecord(model, id));
            return this.createRecord(model, values).id;
        });
    }

    rpc_name_search(model, args, kwargs) {
        const { name, domain, limit } = getArgs(args, kwargs, ["name", "domain", "operator", "limit"]);
        const search = (name || "").toLowerCase();
        return this.filter(model, domain)
            .filter((record) => this.getDisplayName(model, record).toLowerCase().includes(search))
            .slice(0, limit || 100)
            .map((record) => [record.id, this.getDisplayName(model, record)]);
    }

    rpc_web_name_search(model, args, kwargs) {
        const params = getArgs(args, kwargs, ["name", "specification", "domain", "operator", "limit"]);
        const pairs = this.rpc_name_search(model, [params.name, params.domain, params.operator, params.limit], {});
        const records = pairs.map(([id]) => this.getRecord(model, id));
        return this.readRecords(model, records, params.specification).map((record) => ({
            ...record,
            __formatted_display_name: this.getDisplayName(model, this.getRecord(model, record.id)),
        }));
    }

    rpc_name_create(model, args, kwargs) {
        const { name } = getArgs(args, kwargs, ["name"]);
        const record = this.createRecord(model, { [model.recName]: name });
        return [record.id, this.getDisplayName(model, record)];
    }

    rpc_fields_get(model) {
        return model.fields;
    }

    rpc_default_get(model, args, kwargs) {
        const { fields_list } = getArgs(args, kwargs, ["fields_list"]);
        const result = {};
        for (const fieldName of fields_list || []) {
            if ("default" in (model.fields[fieldName] || {})) {
                result[fieldName] = model.fields[fieldName].default;
            }
        }
        return result;
    }

    rpc_get_views(model, args, kwargs) {
        const { views } = getArgs(args, kwargs, ["views", "options"]);
        const result = { models: {}, views: {} };
        for (const [viewId, viewType] of views) {
            const arch = this.postprocessArch(this.getArch(model, viewType), model.name);
            result.views[viewType] = { arch, id: viewId || false };
        }
        for (const [name, otherModel] of Object.entries(this.models)) {
            result.models[name] = { fields: otherModel.fields };
        }
        return result;
    }

    /**
     * Added by web_hierarchy to every model: the records of the domain with
     * their parent and children, for the hierarchy view.
     */
    rpc_hierarchy_read(model, args, kwargs) {
        const { domain, specification, parent_field, child_field, order } = getArgs(args, kwargs, [
            "domain",
            "specification",
            "parent_field",
            "child_field",
            "order",
        ]);
        const spec = { ...specification };
        spec[parent_field] ??= { fields: { display_name: {} } };
        let { records } = this.search(model, domain, { order });
        if (!records.length) {
            return [];
        }
        let withChildren = records;
        if (records.length === 1) {
            const [record] = records;
            const parent = this.getRecord(model, this.getValue(model, record, parent_field));
            records = parent ? [record, parent] : [record];
            const ids = records.map((r) => r.id);
            const parentIds = parent ? ids : [record.id];
            records.push(
                ...model.records.filter(
                    (r) => !ids.includes(r.id) && parentIds.includes(this.getValue(model, r, parent_field))
                )
            );
            withChildren = parent ? records.filter((r) => r !== parent) : records;
        }
        const result = this.readRecords(model, records, spec);
        if (!child_field) {
            for (const data of result) {
                if (withChildren.some((r) => r.id === data.id)) {
                    const childIds = model.records
                        .filter((r) => this.getValue(model, r, parent_field) === data.id)
                        .map((r) => r.id);
                    if (childIds.length) {
                        data.__child_ids__ = childIds;
                    }
                }
            }
        }
        return result;
    }

    rpc_get_unusual_days() {
        return {};
    }

    rpc_get_formview_id() {
        return false;
    }

    rpc_get_formview_action(model, args, kwargs) {
        const { ids } = getArgs(args, kwargs, ["ids"]);
        return {
            type: "ir.actions.act_window",
            res_model: model.name,
            res_id: ids[0],
            views: [[false, "form"]],
            target: "current",
        };
    }

    rpc_web_resequence(model, args, kwargs) {
        const { ids, specification, field_name, offset } = getArgs(args, kwargs, [
            "ids",
            "specification",
            "field_name",
            "offset",
        ]);
        const fieldName = field_name || "sequence";
        ids.forEach((id, index) => {
            this.getRecord(model, id)[fieldName] = (offset || 0) + index;
        });
        return this.rpc_web_read(model, [ids, specification], {});
    }

    rpc_read_progress_bar(model, args, kwargs) {
        const { domain, group_by, progress_bar } = getArgs(args, kwargs, [
            "domain",
            "group_by",
            "progress_bar",
        ]);
        const result = {};
        for (const record of this.filter(model, domain)) {
            const groupValue = String(this.getValue(model, record, group_by));
            const barValue = this.getValue(model, record, progress_bar.field);
            result[groupValue] ||= {};
            result[groupValue][barValue] = (result[groupValue][barValue] || 0) + 1;
        }
        return result;
    }

    rpc_web_read_group(model, args, kwargs) {
        const params = getArgs(args, kwargs, [
            "domain",
            "groupby",
            "aggregates",
            "limit",
            "offset",
            "order",
            "auto_unfold",
            "opening_info",
            "unfold_read_specification",
            "unfold_read_default_limit",
        ]);
        const groups = this.readGroup(model, params.domain, params.groupby.slice(0, 1), params.aggregates || []);
        const openingInfo = Object.fromEntries(
            (params.opening_info || []).map((info) => [String(info.value), info])
        );
        for (const group of groups) {
            const rawValue = [group[params.groupby[0]]].flat()[0];
            const info = openingInfo[String(rawValue)];
            const isOpen = info ? !info.folded : params.auto_unfold;
            if (!isOpen) {
                continue;
            }
            const domain = [...group.__extra_domain, ...(params.domain || [])];
            if (params.groupby.length > 1) {
                const subgroups = this.readGroup(model, domain, params.groupby.slice(1, 2), params.aggregates || []);
                group.__groups = { groups: subgroups, length: subgroups.length };
            } else {
                group.__records = this.rpc_web_search_read(model, [], {
                    domain,
                    specification: params.unfold_read_specification || {},
                    limit: info?.limit || params.unfold_read_default_limit,
                    offset: info?.offset || 0,
                    order: params.order,
                }).records;
            }
        }
        const offset = params.offset || 0;
        return {
            groups: groups.slice(offset, params.limit ? offset + params.limit : undefined),
            length: groups.length,
        };
    }

    rpc_formatted_read_group(model, args, kwargs) {
        const { domain, groupby, aggregates } = getArgs(args, kwargs, ["domain", "groupby", "aggregates"]);
        return this.readGroup(model, domain, groupby || [], aggregates || []);
    }

    rpc_formatted_read_grouping_sets(model, args, kwargs) {
        const { domain, grouping_sets, aggregates } = getArgs(args, kwargs, [
            "domain",
            "grouping_sets",
            "aggregates",
        ]);
        return grouping_sets.map((groupby) => this.readGroup(model, domain, groupby, aggregates || []));
    }

    /**
     * Groups records on one or several fields ("partner_id", "date:month"),
     * formatted like `formatted_read_group`. Without groupby, a single group
     * aggregates every record.
     *
     * @param {string[]} groupbySpecs
     */
    readGroup(model, domain, groupbySpecs, aggregates) {
        const records = this.filter(model, domain);
        if (!groupbySpecs.length) {
            return [this.aggregate(model, records, aggregates, { __extra_domain: [] })];
        }
        const buckets = new Map();
        for (const record of records) {
            let combinations = [{ sortKeys: [], group: {}, extraDomain: [] }];
            for (const spec of groupbySpecs) {
                const options = this.getGroupOptions(model, record, spec);
                combinations = combinations.flatMap((combination) =>
                    options.map((option) => ({
                        sortKeys: [...combination.sortKeys, option.sortKey],
                        group: { ...combination.group, [spec]: option.value },
                        extraDomain: [...combination.extraDomain, ...option.extraDomain],
                    }))
                );
            }
            for (const { sortKeys, group, extraDomain } of combinations) {
                const key = JSON.stringify(sortKeys);
                if (!buckets.has(key)) {
                    buckets.set(key, { sortKeys, group: { ...group, __extra_domain: extraDomain }, records: [] });
                }
                buckets.get(key).records.push(record);
            }
        }
        return [...buckets.values()]
            .sort((a, b) => {
                for (let i = 0; i < a.sortKeys.length; i++) {
                    const result = compareValues(a.sortKeys[i], b.sortKeys[i]);
                    if (result) {
                        return result;
                    }
                }
                return 0;
            })
            .map((bucket) => this.aggregate(model, bucket.records, aggregates, bucket.group));
    }

    /**
     * The groups a record belongs to for one groupby spec: several for a
     * many2many. Dates are grouped by period, "month" by default, and a group
     * value is then the start of the period and its label.
     *
     * @returns {{ value: any, sortKey: any, extraDomain: any[] }[]}
     */
    getGroupOptions(model, record, spec) {
        const [fieldName, granularity] = spec.split(":");
        const field = model.fields[fieldName];
        const raw = this.getValue(model, record, fieldName);
        const isEmpty = raw === false || raw === undefined || raw === null || (Array.isArray(raw) && !raw.length);
        if (isEmpty) {
            return [{ value: false, sortKey: false, extraDomain: [[fieldName, "=", false]] }];
        }
        if (field?.relation) {
            const comodel = this.models[field.relation];
            return [raw].flat().map((id) => {
                const related = comodel && this.getRecord(comodel, id);
                const name = related ? this.getDisplayName(comodel, related) : String(id);
                return {
                    value: [id, name],
                    sortKey: name,
                    extraDomain: [[fieldName, field.type === "many2many" ? "in" : "=", id]],
                };
            });
        }
        if (field?.type === "date" || field?.type === "datetime") {
            return [this.getDateGroupOption(field, raw, granularity || "month")];
        }
        return [{ value: raw, sortKey: raw, extraDomain: [[fieldName, "=", raw]] }];
    }

    getDateGroupOption(field, raw, granularity) {
        const { DateTime } = luxon;
        const isDate = field.type === "date";
        const date = isDate
            ? DateTime.fromISO(raw, { zone: "utc" })
            : DateTime.fromSQL(raw, { zone: "utc" });
        if (granularity in DATE_NUMBERS) {
            const number = DATE_NUMBERS[granularity](date);
            return { value: number, sortKey: number, extraDomain: [] };
        }
        const unit = granularity in DATE_PERIOD_LABELS ? granularity : "month";
        const start = date.startOf(unit);
        const end = start.plus({ [unit]: 1 });
        const serialize = (value) => (isDate ? value.toISODate() : value.toFormat("yyyy-MM-dd HH:mm:ss"));
        return {
            value: [serialize(start), start.toFormat(DATE_PERIOD_LABELS[unit])],
            sortKey: serialize(start),
            extraDomain: [
                [field.name, ">=", serialize(start)],
                [field.name, "<", serialize(end)],
            ],
        };
    }

    aggregate(model, records, aggregates, group) {
        group.__count = records.length;
        for (const spec of aggregates) {
            if (spec === "__count") {
                continue;
            }
            const [fieldName, func = "sum"] = spec.split(":");
            const values = records.map((r) => this.getValue(model, r, fieldName));
            const numbers = values.filter((v) => typeof v === "number");
            switch (func) {
                case "sum":
                    group[spec] = numbers.reduce((a, b) => a + b, 0);
                    break;
                case "avg":
                    group[spec] = numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
                    break;
                case "min":
                    group[spec] = numbers.length ? Math.min(...numbers) : false;
                    break;
                case "max":
                    group[spec] = numbers.length ? Math.max(...numbers) : false;
                    break;
                case "count":
                case "count_distinct":
                    group[spec] = new Set(values.filter((v) => v !== false)).size;
                    break;
                case "array_agg":
                    group[spec] = values;
                    break;
                case "array_agg_distinct":
                    group[spec] = [...new Set(values)];
                    break;
                default:
                    group[spec] = false;
            }
        }
        return group;
    }

    // -------------------------------------------------------------------------
    // Views
    // -------------------------------------------------------------------------

    /**
     * Does what the server does to an arch before sending it: marks the fields
     * that trigger an onchange method or a compute with `on_change="1"`, so the
     * client calls `onchange` when they change.
     *
     * @param {string} arch
     * @param {string} modelName model of the root of the arch
     */
    postprocessArch(arch, modelName) {
        const doc = new DOMParser().parseFromString(arch, "text/xml");
        if (doc.querySelector("parsererror")) {
            return arch;
        }
        let changed = false;
        for (const node of doc.querySelectorAll("field[name]")) {
            // Fields nested in an x2many field belong to its comodel.
            const path = [];
            for (let parent = node.parentElement; parent; parent = parent.parentElement) {
                if (parent.tagName === "field") {
                    path.unshift(parent.getAttribute("name"));
                }
            }
            let model = this.models[modelName];
            for (const fieldName of path) {
                model = this.models[model?.fields[fieldName]?.relation];
            }
            if (this.onchangeTriggers.get(model?.name)?.has(node.getAttribute("name")) && !node.hasAttribute("on_change")) {
                node.setAttribute("on_change", "1");
                changed = true;
            }
        }
        return changed ? new XMLSerializer().serializeToString(doc) : arch;
    }

    /**
     * Returns the arch given for this model and view type, or a default arch
     * listing its fields (used by x2many sub views and dialogs).
     */
    getArch(model, viewType) {
        if (model.views[viewType]) {
            return model.views[viewType];
        }
        const fieldNames = Object.keys(model.fields).filter(
            (name) => !["id", "display_name"].includes(name) && !model.fields[name].hidden
        );
        const fieldNodes = (names) => names.map((name) => `<field name="${name}"/>`).join("");
        const simpleFields = fieldNames.filter(
            (name) => !X2MANY_TYPES.includes(model.fields[name].type)
        );
        switch (viewType) {
            case "form":
                return `<form><sheet><group>${fieldNodes(simpleFields)}</group></sheet></form>`;
            case "list":
                return `<list>${fieldNodes(simpleFields.length ? simpleFields : ["display_name"])}</list>`;
            case "kanban":
                return `<kanban><templates><t t-name="card"><field name="display_name" class="fw-bold"/></t></templates></kanban>`;
            case "search": {
                const fields = simpleFields.filter((name) => ["char", "many2one"].includes(model.fields[name].type));
                const groupables = simpleFields.filter((name) =>
                    ["many2one", "selection", "date", "datetime"].includes(model.fields[name].type)
                );
                const groupBys = groupables.map(
                    (name) =>
                        `<filter name="groupby_${name}" string="${model.fields[name].string}" context="{'group_by': '${name}'}"/>`
                );
                return [
                    "<search>",
                    ...fields.map((name) => `    <field name="${name}"/>`),
                    ...(groupBys.length ? ["    <group>", ...groupBys.map((f) => `        ${f}`), "    </group>"] : []),
                    "</search>",
                ].join("\n");
            }
        }
        return `<${viewType}/>`;
    }
}
