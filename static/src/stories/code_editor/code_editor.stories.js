/** @odoo-module */

import { registry } from "@web/core/registry";
import { CodeEditor } from "../../js/components/code_editor/code_editor";
import { getEventFunction } from "../utils/utils";

const storyA = {
    title: "CodeEditor",
    component: CodeEditor,
    props: {
        type: {
            dynamic: true,
            default: "qweb",
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

export const CodeEditorStories = {
    title: "CodeEditor",
    module: "web",
    stories: [storyA],
};

registry.category("stories").add("ui_playground.code_editor", CodeEditorStories);
