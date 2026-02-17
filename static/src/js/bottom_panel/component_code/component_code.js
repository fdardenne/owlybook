/** @odoo-module */

import { Component } from "@odoo/owl";
import { useStories } from "../../stories";
import { CodeEditor } from "../../components/code_editor/code_editor";

export class ComponentCode extends Component {
    static template = "owlybook.ComponentCode";
    static components = { CodeEditor };

    setup() {
        this.stories = useStories();
        if (this.props.mode === "js") {
            this.sourceCode = this.stories.active.parentComponent.toString();
        } else {
            this.sourceCode = "(Template source not available)";
        }
    }

    get mode() {
        return this.props.mode === "xml" ? "qweb" : "default";
    }
}
