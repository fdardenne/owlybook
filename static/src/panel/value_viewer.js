import { Component, proxy, t, useProps } from "@odoo/owl";

const MAX_ENTRIES = 100;

/**
 * Shows any value as a collapsible tree: event arguments can be DOM events,
 * records or class instances, not only JSON.
 */
export class ValueViewer extends Component {
    static template = "owlybook.ValueViewer";
    static components = { ValueViewer };

    props = useProps({
        value: t.any().optional(),
        name: t.or([t.string(), t.number()]).optional(),
        depth: t.number().optional(0),
        open: t.boolean().optional(false),
    });

    setup() {
        this.state = proxy({ open: this.props.open });
    }

    isExpandable() {
        const value = this.props.value;
        return (
            value !== null &&
            typeof value === "object" &&
            !(value instanceof Element) &&
            this.props.depth < 8
        );
    }

    getEntries() {
        const value = this.props.value;
        if (value instanceof Map) {
            return [...value.entries()].slice(0, MAX_ENTRIES);
        }
        if (value instanceof Set) {
            return [...value].slice(0, MAX_ENTRIES).map((item, index) => [index, item]);
        }
        if (value instanceof Event) {
            const keys = ["type", "target", "key", "button", "detail", "defaultPrevented"];
            return keys.filter((key) => value[key] !== undefined).map((key) => [key, value[key]]);
        }
        return Object.entries(value).slice(0, MAX_ENTRIES);
    }

    getSummary() {
        const value = this.props.value;
        if (Array.isArray(value)) {
            return `Array(${value.length})`;
        }
        if (value instanceof Element) {
            return `<${value.tagName.toLowerCase()}${value.className ? `.${String(value.className).split(" ")[0]}` : ""}>`;
        }
        const name = value?.constructor?.name;
        const size = value instanceof Map || value instanceof Set ? value.size : Object.keys(value).length;
        return `${name && name !== "Object" ? name : ""} {${size ? "..." : ""}}`;
    }

    formatPrimitive() {
        const value = this.props.value;
        if (value instanceof Element) {
            return this.getSummary();
        }
        if (typeof value === "string") {
            return JSON.stringify(value);
        }
        if (typeof value === "function") {
            return `ƒ ${value.name || "anonymous"}()`;
        }
        return String(value);
    }

    getPrimitiveClass() {
        const type = this.props.value === null ? "null" : typeof this.props.value;
        return `o_owlybook_value_${type}`;
    }
}
