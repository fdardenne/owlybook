/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { useStories } from "../stories";
import { Props } from "./props/props";
import { CodeEditor } from "../components/code_editor/code_editor";

export class Panel extends Component {
    static template = "ui_playground.panel";
    static components = { Props, CodeEditor };

    setup() {
        this.stories = useStories();
        this.state = useState({ mode: undefined, dirtyArch: undefined });
    }

    get mode() {
        if (this.state.mode) {
            return this.state.mode;
        }
        return this.stories.active.arch ? "code" : "props";
    }
    changeMode(mode) {
        this.state.mode = mode;
    }

    saveDirtyArch() {
        this.stories.active.arch = this.state.dirtyArch;
        this.state.dirtyArch = undefined;
    }

    get isArchDirty() {
        return (
            this.state.dirtyArch !== undefined && this.state.dirtyArch !== this.stories.active.arch
        );
    }
}
