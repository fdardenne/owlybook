/** @odoo-module */
import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { CodeEditor } from "../../js/components/code_editor/code_editor";
import { getEventFunction } from "../utils/utils";

class CodeEditorParent extends Component {
    static storyConfig = {
        title: "CodeEditor",
        component: CodeEditor,
        props: {
            type: {
                default: "qweb",
                help: "Defines the language in the code editor",
            },
            value: {
                dynamic: true,
                default: "<form/>",
            },
            class: {
                dynamic: true,
            },
            theme: {
                dynamic: true,
                default: "monokai",
            },
            onChange: {
                default: getEventFunction("onChange"),
            },
        },
    };

    static template = "ui_playground.CodeEditorStories";
    static codeTemplate = "ui_playground.CodeEditorCall";
    static components = { CodeEditor };
}

export const CodeEditorStories = {
    title: "Core components",
    module: "web",
    stories: [CodeEditorParent],
};

registry.category("stories").add("ui_playground.code_editor", CodeEditorStories);
