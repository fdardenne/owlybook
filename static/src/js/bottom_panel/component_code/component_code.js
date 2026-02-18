/** @odoo-module */

import { Component } from "@odoo/owl";
import { useStories } from "../../stories";
import { CodeEditor } from "@web/core/code_editor/code_editor";
import { getTemplate } from "@web/core/templates";

export class ComponentCode extends Component {
    static template = "owlybook.ComponentCode";
    static components = { CodeEditor };

    setup() {
        this.stories = useStories();
        if (this.props.mode === "js") {
            this.sourceCode = this.stories.active.parentComponent.toString();
        } else {
            debugger
            const codeTemplateName = this.stories.active.parentComponent.codeTemplate;
            const templateName = this.stories.active.parentComponent.template;
            this.sourceCode = getTemplate(codeTemplateName || templateName)?.innerHTML;
        }
    }

    get mode() {
        return this.props.mode === "xml" ? "qweb" : "javascript";
    }
}
