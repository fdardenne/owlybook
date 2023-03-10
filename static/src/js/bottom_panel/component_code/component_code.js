/** @odoo-module */

import { Component } from "@odoo/owl";
import { useStories } from "../../stories";
import { CodeEditor } from "../../components/code_editor/code_editor";

export class ComponentCode extends Component {
    static template = "ui_playground.ComponentCode";
    static components = { CodeEditor };

    setup() {
        this.stories = useStories();
        if (this.props.mode === "js") {
            this.sourceCode = this.stories.active.parentComponent.toString();
        } else {
            const codeTemplateName = this.stories.active.parentComponent.codeTemplate;
            const templateName = this.stories.active.parentComponent.template;
            this.sourceCode =
                // @ts-ignore
                this.__owl__.app.rawTemplates[codeTemplateName || templateName]?.innerHTML;
        }
    }

    get mode() {
        return this.props.mode === "xml" ? "qweb" : "default";
    }
}
