/**
 * Builds the controls of a view story from its arch: every `<field>` and
 * `<widget>` node gets the attributes and options its widget understands, as
 * declared in the registries (`supportedAttributes`, `supportedOptions`) and
 * as read by its `extractProps` function. Changing a control rewrites the
 * node in the arch, the arch stays the only source of truth.
 */
import { evaluateExpr } from "@web/core/py_js/py";
import { registry } from "@web/core/registry";
import { parseXML } from "@web/core/utils/xml";
import { getFieldFromRegistry } from "@web/views/fields/field";

const fieldRegistry = registry.category("fields");
const widgetRegistry = registry.category("view_widgets");

const VIEW_TAGS = ["form", "list", "kanban", "calendar", "graph", "pivot", "search", "gantt"];
const TRUE_VALUES = ["1", "true", "True"];
/** Values of the node itself that extractProps can receive, mapped to attributes. */
const NODE_ATTRIBUTES = ["string", "placeholder", "help"];

/**
 * @typedef {Object} ArchControl
 * @property {string} key unique in the node, e.g. "attr:placeholder", "option:no_open"
 * @property {"attr" | "option"} target
 * @property {string} name
 * @property {string} label
 * @property {string} type boolean, string, number, selection, field or any
 * @property {{ label: string, value: any }[]} [choices]
 * @property {string} [help]
 * @property {any} [default]
 * @property {any} value current value, undefined when not set in the arch
 */

// -----------------------------------------------------------------------------
// Python literals, the format of the `options` attribute
// -----------------------------------------------------------------------------

export function toPyLiteral(value) {
    if (value === true) {
        return "True";
    }
    if (value === false) {
        return "False";
    }
    if (value === null || value === undefined) {
        return "None";
    }
    if (typeof value === "number") {
        return String(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map(toPyLiteral).join(", ")}]`;
    }
    if (typeof value === "object") {
        const items = Object.entries(value).map(([k, v]) => `${toPyLiteral(k)}: ${toPyLiteral(v)}`);
        return `{${items.join(", ")}}`;
    }
    return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function parseOptions(node) {
    const options = node.getAttribute("options");
    if (!options) {
        return {};
    }
    try {
        return evaluateExpr(options) || {};
    } catch {
        return {};
    }
}

/**
 * Text typed in a control of unknown type: a Python literal when it is one
 * ("[16, 2]", "True"), the text itself otherwise.
 */
export function parseLiteral(text) {
    try {
        return evaluateExpr(text);
    } catch {
        return text;
    }
}

// -----------------------------------------------------------------------------
// Reading the registries
// -----------------------------------------------------------------------------

/**
 * Lists the attributes and options an `extractProps` function reads, by
 * looking at its source: `attrs.foo`, `attrs["foo"]` and `options.bar`.
 */
export function scanExtractProps(extractProps) {
    const result = { attrs: new Set(), options: new Set() };
    if (typeof extractProps !== "function") {
        return result;
    }
    const source = extractProps.toString();
    for (const [, target, name, quoted] of source.matchAll(/\b(attrs|options)(?:\.(\w+)|\[["'](\w+)["']\])/g)) {
        result[target].add(name || quoted);
    }
    // Destructured: const { path, label, class: classes } = attrs;
    for (const [, names, target] of source.matchAll(/\{([^{}]*)\}\s*=\s*(attrs|options)\b/g)) {
        for (const name of names.split(",").map((part) => part.trim().split(/[\s:=]/)[0])) {
            if (/^\w+$/.test(name)) {
                result[target].add(name);
            }
        }
    }
    // Node values, destructured from the parameter (`({ attrs, placeholder })`)
    // or from a variable (`const { string, placeholder } = staticInfo;`).
    const destructured = [
        ...source.matchAll(/^[^(]*\(\s*\{([^}]*)\}/g),
        ...source.matchAll(/\{([^{}]*)\}\s*=\s*\w+/g),
    ];
    for (const [, names] of destructured) {
        for (const name of names.split(",").map((part) => part.trim().split(/[\s:=]/)[0])) {
            if (NODE_ATTRIBUTES.includes(name)) {
                result.attrs.add(name);
            }
        }
    }
    result.attrs.delete(undefined);
    result.options.delete(undefined);
    return result;
}

function controlFromSupportedInfo(target, info) {
    const control = {
        key: `${target}:${info.name}`,
        target,
        name: info.name,
        // Labels may be lazy translated strings: they are rendered as is.
        label: info.label || info.name,
        help: info.help,
        default: info.default,
        type: "any",
    };
    switch (info.type) {
        case "boolean":
            control.type = "boolean";
            break;
        case "string":
        case "char":
            control.type = "string";
            break;
        case "number":
        case "integer":
            control.type = "number";
            break;
        case "selection":
            control.type = "selection";
            control.choices = (info.choices || []).map((choice) => ({
                label: choice.label,
                value: choice.value,
            }));
            break;
        case "field":
            control.type = "field";
            control.availableTypes = info.availableTypes;
            break;
    }
    return control;
}

/**
 * Widgets that can display a field of the given type, for the widget control.
 */
export function getCompatibleWidgets(fieldType) {
    return fieldRegistry
        .getEntries()
        .filter(([key, entry]) => !key.includes(".") && entry.supportedTypes?.includes(fieldType))
        .map(([key, entry]) => ({ value: key, label: entry.displayName ? `${key} (${entry.displayName})` : key }))
        .sort((a, b) => a.value.localeCompare(b.value));
}

function getFieldNodeControls(entry, fieldType, viewType) {
    const controls = [
        {
            key: "attr:widget",
            target: "attr",
            name: "widget",
            label: "Widget",
            type: "selection",
            choices: getCompatibleWidgets(fieldType),
            help: "Widgets of the fields registry that support this field type",
        },
        { key: "attr:string", target: "attr", name: "string", label: "Label", type: "string" },
        { key: "attr:readonly", target: "attr", name: "readonly", label: "Readonly", type: "boolean" },
        { key: "attr:required", target: "attr", name: "required", label: "Required", type: "boolean" },
        { key: "attr:invisible", target: "attr", name: "invisible", label: "Invisible", type: "boolean" },
    ];
    if (viewType === "form") {
        controls.push({ key: "attr:nolabel", target: "attr", name: "nolabel", label: "No label", type: "boolean" });
    }
    return controls;
}

function getEntryControls(entry) {
    const controls = [];
    for (const info of entry?.supportedAttributes || []) {
        controls.push(controlFromSupportedInfo("attr", info));
    }
    for (const info of entry?.supportedOptions || []) {
        controls.push(controlFromSupportedInfo("option", info));
    }
    const scanned = scanExtractProps(entry?.extractProps);
    for (const name of scanned.attrs) {
        const type = ["string", "placeholder", "help"].includes(name) ? "string" : "any";
        controls.push({ key: `attr:${name}`, target: "attr", name, label: name, type });
    }
    for (const name of scanned.options) {
        controls.push({ key: `option:${name}`, target: "option", name, label: name, type: "any" });
    }
    return controls;
}

function uniqueControls(controls) {
    const byKey = new Map();
    for (const control of controls) {
        if (!byKey.has(control.key)) {
            byKey.set(control.key, control);
        }
    }
    return [...byKey.values()];
}

// -----------------------------------------------------------------------------
// Reading and writing the arch
// -----------------------------------------------------------------------------

function getControllableNodes(root) {
    return [...root.querySelectorAll("field, widget")].filter(
        (node) => node.tagName !== "field" || node.getAttribute("name")
    );
}

/**
 * The model a node belongs to: the main model, or the comodel of the x2many
 * fields it is nested in.
 */
function getNodeModel(node, models, resModel) {
    const x2manyAncestors = [];
    let parent = node.parentElement;
    while (parent) {
        if (parent.tagName === "field") {
            x2manyAncestors.unshift(parent.getAttribute("name"));
        }
        parent = parent.parentElement;
    }
    let modelName = resModel;
    for (const fieldName of x2manyAncestors) {
        modelName = models[modelName]?.fields[fieldName]?.relation || modelName;
    }
    return models[modelName];
}

function getNodeViewType(node) {
    let parent = node.parentElement;
    while (parent && !VIEW_TAGS.includes(parent.tagName)) {
        parent = parent.parentElement;
    }
    return parent ? parent.tagName : node.ownerDocument.documentElement.tagName;
}

function readControlValue(node, control, options) {
    if (control.target === "option") {
        return options[control.name];
    }
    if (!node.hasAttribute(control.name)) {
        return undefined;
    }
    const value = node.getAttribute(control.name);
    switch (control.type) {
        case "boolean":
            return TRUE_VALUES.includes(value) ? true : ["0", "false", "False"].includes(value) ? false : value;
        case "number":
            return Number(value);
        case "selection":
            return control.choices.find((choice) => String(choice.value) === value)?.value ?? value;
    }
    return value;
}

/**
 * @typedef {Object} ArchNode
 * @property {number} index position among the controllable nodes of the arch
 * @property {string} label e.g. "partner_id (many2one)"
 * @property {string} tag "field" or "widget"
 * @property {string} name
 * @property {string} [widget]
 * @property {string} [fieldType]
 * @property {Object} [model] normalized model of the node
 * @property {ArchControl[]} controls
 */

/**
 * @param {string} arch
 * @param {Record<string, Object>} models normalized models, see models.js
 * @param {string} resModel
 * @returns {ArchNode[]}
 */
export function getArchNodes(arch, models, resModel) {
    let root;
    try {
        root = parseXML(arch);
    } catch {
        return [];
    }
    return getControllableNodes(root).map((node, index) => {
        const name = node.getAttribute("name");
        const widget = node.getAttribute("widget") || undefined;
        const options = parseOptions(node);
        let controls;
        let label;
        let fieldType;
        let model;
        if (node.tagName === "widget") {
            const entry = widgetRegistry.get(name, null);
            controls = getEntryControls(entry);
            label = `<widget name="${name}">`;
        } else {
            model = getNodeModel(node, models, resModel);
            fieldType = model?.fields[name]?.type;
            const viewType = getNodeViewType(node);
            const entry = fieldType && getFieldFromRegistry(fieldType, widget, viewType);
            controls = [...getFieldNodeControls(entry, fieldType, viewType), ...getEntryControls(entry)];
            label = `${name}${widget ? ` (${widget})` : fieldType ? ` (${fieldType})` : ""}`;
        }
        controls = uniqueControls(controls).map((control) => ({
            ...control,
            value: readControlValue(node, control, options),
        }));
        return { index, label, tag: node.tagName, name, widget, fieldType, model, controls };
    });
}

function isEmptyValue(value) {
    return value === undefined || value === "" || value === null;
}

/**
 * @param {string} arch
 * @param {number} nodeIndex see ArchNode.index
 * @param {ArchControl} control
 * @param {any} value undefined (or "") removes the attribute or the option
 * @returns {string} the new arch
 */
export function setArchControlValue(arch, nodeIndex, control, value) {
    const root = parseXML(arch);
    const node = getControllableNodes(root)[nodeIndex];
    if (control.target === "option") {
        const options = parseOptions(node);
        if (isEmptyValue(value)) {
            delete options[control.name];
        } else {
            options[control.name] = value;
        }
        if (Object.keys(options).length) {
            node.setAttribute("options", toPyLiteral(options));
        } else {
            node.removeAttribute("options");
        }
    } else if (isEmptyValue(value) || (control.type === "boolean" && value === false)) {
        node.removeAttribute(control.name);
    } else {
        node.setAttribute(control.name, value === true ? "1" : String(value));
    }
    return new XMLSerializer().serializeToString(root);
}
