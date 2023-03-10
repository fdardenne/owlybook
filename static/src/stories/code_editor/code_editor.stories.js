/** @odoo-module */
import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { CodeEditor } from "../../js/components/code_editor/code_editor";
import { getEventFunction } from "../utils/utils";

class CodeEditorParent extends Component {
    static template = "ui_playground.CodeEditorStories";
    static components = { CodeEditor };
}

CodeEditorParent.codeTemplate = "ui_playground.CodeEditorCall";
CodeEditorParent.storyConfig = {
    title: "CodeEditor",
    component: CodeEditor,
    props: {
        type: {
            value: "qweb",
            help: "Defines the language in the code editor",
            readonly: true,
        },
        value: {
            value: "<form/>",
        },
        theme: {
            value: "monokai",
        },
        onChange: {
            value: getEventFunction("onChange"),
        },
    },
    noCode: true,
};

export const CodeEditorStories = {
    title: "Core components",
    module: "web",
    stories: [CodeEditorParent],
};

registry.category("stories").add("ui_playground.code_editor", CodeEditorStories);
