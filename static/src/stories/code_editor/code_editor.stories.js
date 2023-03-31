/** @odoo-module */
import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { CodeEditor } from "../../js/components/code_editor/code_editor";
import { getEventFunction } from "../../js/stories";

class CodeEditorParent extends Component {
    static template = "owlybook.CodeEditorStories";
    static components = { CodeEditor };
}

CodeEditorParent.codeTemplate = "owlybook.CodeEditorCall";
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

registry.category("stories").add("owlybook.code_editor", CodeEditorStories);
