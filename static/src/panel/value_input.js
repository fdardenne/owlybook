import { Component, proxy, t, useProps } from "@odoo/owl";
import { toPyLiteral, parseLiteral } from "../story/arch_controls";

/**
 * Edits one control value. The type decides the input:
 * - boolean, string, number, selection: the matching form input;
 * - json: a JSON text area, for arrays and objects;
 * - literal: a Python literal, for arch options of unknown type;
 * - callback, readonly: no input, the value is described.
 */
export class ValueInput extends Component {
    static template = "owlybook.ValueInput";

    props = useProps({
        type: t.string(),
        value: t.any().optional(),
        onChange: t.function(),
        choices: t.array().optional(),
        readonly: t.boolean().optional(false),
        placeholder: t.string().optional(""),
    });

    setup() {
        this.state = proxy({ invalid: false });
    }

    formatJson(value) {
        if (value === undefined) {
            return "";
        }
        try {
            return JSON.stringify(value, null, 2) ?? "";
        } catch {
            return "";
        }
    }

    formatLiteral(value) {
        if (value === undefined) {
            return "";
        }
        return typeof value === "string" ? value : toPyLiteral(value);
    }

    getRows(text) {
        return Math.min(8, Math.max(1, text.split("\n").length));
    }

    describeReadonly(value) {
        if (value === undefined) {
            return "not set";
        }
        if (typeof value === "function") {
            return value.name ? `${value.name}()` : "function";
        }
        return value?.constructor?.name || typeof value;
    }

    isSelected(choice) {
        return String(choice.value) === String(this.props.value);
    }

    onSelectChange(ev) {
        const choice = this.props.choices.find((c) => String(c.value) === ev.target.value);
        this.props.onChange(choice ? choice.value : undefined);
    }

    onNumberChange(ev) {
        const text = ev.target.value.trim();
        this.props.onChange(text === "" ? undefined : Number(text));
    }

    onJsonChange(ev) {
        const text = ev.target.value.trim();
        if (!text) {
            this.state.invalid = false;
            this.props.onChange(undefined);
            return;
        }
        try {
            const value = JSON.parse(text);
            this.state.invalid = false;
            this.props.onChange(value);
        } catch {
            this.state.invalid = true;
        }
    }

    onLiteralChange(ev) {
        const text = ev.target.value.trim();
        this.props.onChange(text === "" ? undefined : parseLiteral(text));
    }
}
