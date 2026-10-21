import { Component, computed, proxy, t, useProps } from "@odoo/owl";
import { CodeEditor } from "@web/core/code_editor/code_editor";
import { getComponentCode } from "./code_snippet";
import { ValueInput } from "./value_input";
import { ValueViewer } from "./value_viewer";

const INPUT_TYPE_BY_KIND = {
    boolean: "boolean",
    number: "number",
    string: "string",
    selection: "selection",
    function: "callback",
    array: "json",
    object: "json",
    any: "json",
};

function isJsonSerializable(value) {
    if (value === undefined) {
        return true;
    }
    if (typeof value === "function") {
        return false;
    }
    try {
        JSON.stringify(value);
    } catch {
        return false;
    }
    const isPlain = (v) =>
        v === null ||
        typeof v !== "object" ||
        Array.isArray(v) ||
        Object.getPrototypeOf(v) === Object.prototype ||
        Object.getPrototypeOf(v) === null;
    return isPlain(value);
}

function formatDefault(description) {
    if (!description.getDefault) {
        return "";
    }
    try {
        const value = description.getDefault();
        if (typeof value === "function") {
            return "";
        }
        return value === undefined ? "" : `Default: ${JSON.stringify(value)}`;
    } catch {
        return "";
    }
}

/**
 * The panel under a story: its controls, the events it triggered and the
 * code to reuse it.
 */
export class StoryPanel extends Component {
    static template = "owlybook.StoryPanel";
    static components = { CodeEditor, ValueInput, ValueViewer };

    props = useProps({
        runtime: t.object(),
        tabs: t.array(t.string()).optional(() => ["controls", "events", "code"]),
    });

    setup() {
        this.state = proxy({
            tab: "controls",
            nodeIndex: null,
            draftArch: null,
            draftSearchArch: null,
        });
        this.componentCode = computed(() => {
            const runtime = this.props.runtime;
            return runtime.type === "component" ? getComponentCode(runtime) : null;
        });
    }

    selectTab(tab) {
        this.state.tab = tab;
    }

    // -------------------------------------------------------------------------
    // Component controls
    // -------------------------------------------------------------------------

    getPropRows() {
        return this.props.runtime.getControls().map(({ name, description, control, value }) => {
            let type = INPUT_TYPE_BY_KIND[description.kind] || "readonly";
            let choices;
            if (control.choices || description.kind === "selection") {
                type = "selection";
                choices = (control.choices || description.choices).map((choice) =>
                    typeof choice === "object" && choice !== null && "value" in choice
                        ? choice
                        : { label: String(choice), value: choice }
                );
            } else if (description.kinds) {
                type = "json";
            }
            if (value?.isOwlybookCallback) {
                type = "callback";
            } else if (type === "callback" || (type === "json" && !isJsonSerializable(value))) {
                type = "readonly";
            }
            return {
                name,
                type,
                choices,
                value,
                kindLabel: description.kinds ? description.kinds.join(" | ") : description.kind,
                required: !description.optional,
                help: control.help,
                readonly: Boolean(control.readonly),
                placeholder: formatDefault(description),
            };
        });
    }

    // -------------------------------------------------------------------------
    // View controls
    // -------------------------------------------------------------------------

    getNodes() {
        return this.props.runtime.nodes();
    }

    /**
     * The node whose controls are shown: the one picked by the user, or the
     * first one that uses a widget.
     */
    getActiveNode() {
        const nodes = this.getNodes();
        if (this.state.nodeIndex !== null && nodes[this.state.nodeIndex]) {
            return nodes[this.state.nodeIndex];
        }
        return nodes.find((node) => node.widget || node.tag === "widget") || nodes[0];
    }

    getArchRows(node) {
        return node.controls.map((control) => {
            let type = control.type === "any" ? "literal" : control.type;
            let choices = control.choices;
            if (control.type === "field") {
                type = "selection";
                choices = Object.values(node.model?.fields || {})
                    .filter((field) => !control.availableTypes || control.availableTypes.includes(field.type))
                    .map((field) => ({ label: `${field.string} (${field.name})`, value: field.name }));
            }
            return {
                control,
                type,
                choices,
                placeholder: control.default !== undefined ? `Default: ${JSON.stringify(control.default)}` : "",
            };
        });
    }

    onArchControlChange(node, control, value) {
        this.props.runtime.setControlValue(node.index, control, value);
    }

    // -------------------------------------------------------------------------
    // Code
    // -------------------------------------------------------------------------

    isDebugAssets() {
        return odoo.debug.includes("assets");
    }

    getArchDraft() {
        return this.state.draftArch ?? this.props.runtime.arch();
    }

    isArchDirty() {
        return this.state.draftArch !== null && this.state.draftArch !== this.props.runtime.arch();
    }

    applyArch() {
        this.props.runtime.setArch(this.state.draftArch);
        this.state.draftArch = null;
    }

    getSearchArchDraft() {
        return this.state.draftSearchArch ?? this.props.runtime.searchArch();
    }

    isSearchArchDirty() {
        return (
            this.state.draftSearchArch !== null &&
            this.state.draftSearchArch !== this.props.runtime.searchArch()
        );
    }

    applySearchArch() {
        this.props.runtime.setSearchArch(this.state.draftSearchArch);
        this.state.draftSearchArch = null;
    }

    getModelsJson() {
        const models = {};
        for (const [name, model] of Object.entries(this.props.runtime.server.models)) {
            models[name] = { records: model.records };
        }
        return JSON.stringify(models, null, 2);
    }

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    formatTime(date) {
        return date.toLocaleTimeString([], { hour12: false });
    }
}
