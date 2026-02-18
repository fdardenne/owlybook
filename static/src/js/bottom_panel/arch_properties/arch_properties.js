import { Component } from "@odoo/owl";
import { useStories } from "../../stories";

import { SelectMenu } from "@web/core/select_menu/select_menu";

export class ArchProperties extends Component {
    static template = "owlybook.properties";
    static components = { SelectMenu };

    setup() {
        this.stories = useStories();
        this.isDeleteBtnEnabled = true;
    }

    /**
     * The goal of this function is to get the type of a props so that we can display it in the bottom panel
     * @param {Object} attrs
     * @return {String} type or type name
     */
    propertyType(attrs) {
        return attrs.type?.name || attrs.type;
    }

    /**
     * The goal of this function is the get the processed attrs of an active stories, if there is not then return an empty dic
     * @returns {Object} processed Attrs or empty dico
     */
    get properties() {
        return this.stories.active?.processedAttrs || {};
    }

    /**
     * The goal of this function is to check if the props is in readonly
     * @param attrs
     * @returns {boolean}
     */
    isDisabled(attrs) {
        return !!attrs.readonly;
    }

    /**
     * The goal of this function is to change the value of attrs and also reset the modified arch and dirty arch
     * @param attrs
     * @param value
     */
    onChange(attrs, value) {
        attrs.value = value;
        if (this.env.stories.active.modifiedArch || this.env.stories.active.dirtyArch) {
            this.env.stories.active.modifiedArch = "";
            this.env.stories.active.dirtyArch = "";
        }
    }

    /**
     * The goal of this function is to indicate a warning to users.
     * If they have modified the code, changing the attribute will discard all the changes they made.
     * @returns {string|boolean}
     */
    get warning() {
        return this.stories.active.modifiedArch || this.stories.active.dirtyArch
            ? "If you change the attributes in this tab, the modification you made in the code tab will be lost."
            : false;
    }

    /**
     * The goal of this function is to parse the value if it's a boolean
     * @param type
     * @param value
     * @returns {*}
     */
    formatValue(type, value) {
        if (type === "Boolean") {
            return value === "True" || value === "true" || value === "1" || value === true;
        } else {
            return value;
        }
    }
}
