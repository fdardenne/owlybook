/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useStories } from "../../stories";
import { archParseBoolean } from "@web/views/utils";

export class ArchProperties extends Component {
    static template = "ui_playground.properties";

    setup() {
        this.stories = useStories();
        this.isDeleteBtnEnabled = true;
    }

    propertyType(attrs) {
        return attrs.type?.name || attrs.type;
    }

    get properties() {
        return this.stories.active?.processedAttrs || {};
    }

    isDisabled(attrs) {
        return false;
    }

    onChange(attrs, value) {
        attrs.value = value;
        if (this.env.stories.active.modifiedArch || this.env.stories.active.dirtyArch) {
            this.env.stories.active.modifiedArch = "";
            this.env.stories.active.dirtyArch = "";
        }
    }

    get warning() {
        return this.stories.active.modifiedArch || this.stories.active.dirtyArch
            ? "If you change the attributes in this tab, the modification you made in the code tab will be lost."
            : false;
    }

    formatValue(type, value) {
        if (type === "Boolean") {
            return archParseBoolean(value);
        } else {
            return value;
        }
    }
}
