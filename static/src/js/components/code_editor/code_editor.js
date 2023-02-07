/** @odoo-module */

// TODO: this is a code taken from Studio, this code will later be available in the web module

import {
    Component,
    onMounted,
    onWillDestroy,
    onWillStart,
    onWillUpdateProps,
    useRef,
} from "@odoo/owl";
import { loadJS } from "@web/core/assets";

const ACE_SESSIONS = new Map();

export function useCodeEditor(codeEditorId) {
    return ACE_SESSIONS.get(codeEditorId);
}

export class CodeEditor extends Component {
    static template = "web_studio.CodeEditor";
    static props = {
        type: { type: String },
        value: { type: String, optional: true },
        onChange: { type: Function, optional: true },
        class: { type: String, optional: true },
        theme: { type: String, optional: true },
        id: { type: String, optional: true },
    };
    static defaultProps = {
        class: "",
        theme: "",
    };

    static LIBS = {
        default: ["/web/static/lib/ace/ace.js", "/web/static/lib/ace/theme-monokai.js"],
        js: ["/web/static/lib/ace/mode-js.js", "/web/static/lib/ace/javascript_highlight_rules.js"],
        xml: ["/web/static/lib/ace/mode-xml.js"],
        qweb: ["/web/static/lib/ace/mode-xml.js", "/web/static/lib/ace/mode-qweb.js"],
        scss: ["/web/static/lib/ace/mode-scss.js"],
    };

    setup() {
        this.editorRef = useRef("editorRef");

        onWillStart(() => this.loadLibs("default"));

        onMounted(() => this.loadEditor());
        onWillDestroy(() => {
            this.aceEditor = null;
            if (ACE_SESSIONS.has(this.props.id)) {
                ACE_SESSIONS.delete(this.props.id);
            }
        });

        onWillUpdateProps((nextProps) => {
            if (nextProps.value !== this.value) {
                this.value = nextProps.value;
            }

            if (nextProps.type !== this.type) {
                this.setType(nextProps.type);
            }
        });
    }

    get value() {
        return this.aceEditor.getValue();
    }

    set value(value) {
        this.aceEditor.setValue(value);
    }

    get type() {
        return this._type;
    }

    async setType(newType) {
        await this.loadLibs(newType);
        this._type = newType;
        this.aceEditor.session.setMode(`ace/mode/${newType}`);
    }

    async loadLibs(type) {
        for (const file of CodeEditor.LIBS[type]) {
            await loadJS(file);
        }
    }

    async loadEditor() {
        if (!this.editorRef.el) {
            return;
        }

        this.aceEditor = window.ace.edit(this.editorRef.el.id);
        this.aceEditor.resize();

        await this.setType(this.props.type);
        this.aceEditor.setValue(this.props.value);

        if (this.props.theme) {
            this.aceEditor.setTheme(`ace/theme/${this.props.theme}`);
        }

        if (this.props.id) {
            ACE_SESSIONS.set(this.props.id, this.aceEditor);
        }

        this.aceEditor.session.on("change", (ev) => {
            if (this.props.onChange) {
                this.props.onChange(this.aceEditor.getValue());
            }
        });
    }
}
