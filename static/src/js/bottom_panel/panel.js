/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { useStories } from "../stories";
import { Props } from "./component_properties/props";
import { CodeEditor } from "../components/code_editor/code_editor";
import { ArchProperties } from "./arch_properties/arch_properties";
import { Events } from "./events/events";

export class Panel extends Component {
    static template = "ui_playground.panel";
    static components = { Props, CodeEditor, ArchProperties, Events };

    setup() {
        this.stories = useStories();
        this.state = useState({ mode: undefined });
    }

    get tabsAvailability() {
        return {
            props: this.stories.active.attrs || !this.stories.active.arch,
            code: this.stories.active.arch,
            events: !this.stories.active.arch,
        };
    }

    get mode() {
        if (this.state.mode) {
            return this.state.mode;
        }
        // Return the first available tab
        for (const tab in this.tabsAvailability) {
            if (this.tabsAvailability[tab]) {
                return tab;
            }
        }
        return undefined;
    }
    changeMode(mode) {
        this.state.mode = mode;
    }

    saveDirtyArch() {
        this.stories.active.modifiedArch = this.stories.active.dirtyArch;
        this.stories.active.dirtyArch = undefined;
    }

    get isArchDirty() {
        return (
            this.stories.active.dirtyArch !== undefined &&
            this.stories.active.dirtyArch !== this.stories.activeArch
        );
    }
}
