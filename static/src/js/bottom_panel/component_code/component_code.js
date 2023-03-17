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
            const codeTemplateName = this.stories.active.parentComponent.codeTemplate;
            const templateName = this.stories.active.parentComponent.template;
            this.sourceCode =
                // @ts-ignore
                this.__owl__.app.rawTemplates[codeTemplateName || templateName]?.innerHTML;
        }
    }

    /**
     * The goal of this function is simply to return qweb if the props mode is "xml" otherwise return default
     * @returns {string}
     */
    get mode() {
        return this.props.mode === "xml" ? "qweb" : "default";
    }
}
