/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { useStories } from "../stories";
import { ComponentProperties } from "./component_properties/component_properties";
import { CodeEditor } from "../components/code_editor/code_editor";
import { ArchProperties } from "./arch_properties/arch_properties";
import { Events } from "./events/events";
import { ComponentCode } from "./component_code/component_code";

export class Panel extends Component {
    static template = "owlybook.panel";
    static components = { ComponentProperties, CodeEditor, ArchProperties, Events, ComponentCode };

    setup() {
        this.stories = useStories();
        this.state = useState({ mode: undefined });
    }

    /**
     * The goal of this function is to know which tabs will be displayed in the panel
     * @returns {{code, xml: boolean, js: boolean, events: boolean, props: boolean}}
     */
    get tabsAvailability() {
        return {
            props: this.stories.active.attrs || !this.stories.active.arch,
            code: this.stories.active.arch,
            events: !this.stories.active.arch,
            xml: this.stories.active.parentComponent && !this.stories.active.noCode,
            js: this.stories.active.parentComponent && !this.stories.active.noCode,
        };
    }

    /**
     * The goal of this function is to return the first available tab, if there is a mode in the state return the mode in priority
     * If there is no mode and no tab then return undefined
     * @returns {undefined|*|string}
     */
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

    /**
     * The goal of this function is to change the mode of the state
     * @param mode
     */
    changeMode(mode) {
        this.state.mode = mode;
    }

    /**
     * The goal of this function is that when changing something in the code and save the arch is modified
     */
    saveDirtyArch() {
        this.stories.active.modifiedArch = this.stories.active.dirtyArch;
        this.stories.active.dirtyArch = undefined;
    }

    /**
     * The goal of this function is to know if the arch is dirty
     * @returns {boolean}
     */
    get isArchDirty() {
        return (
            this.stories.active.dirtyArch !== undefined &&
            this.stories.active.dirtyArch !== this.stories.activeArch
        );
    }
}
