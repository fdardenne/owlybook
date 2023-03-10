/** @odoo-module */
import { ColorList } from "@web/core/colorlist/colorlist";
import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
import { getEventFunction } from "../utils/utils";

class ColorListParent extends Component {
    static storyConfig = {
        title: "ColorList",
        component: ColorList,
        props: {
            canToggle: {
                dynamic: true,
                default: true,
            },
            colors: {
                default: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            },
            forceExpanded: {
                dynamic: true,
            },
            isExpanded: {
                dynamic: true,
                default: true,
            },
            selectedColor: {
                dynamic: true,
                default: 9,
            },
            onColorSelected: {
                default: getEventFunction("onColorSelected"),
            },
        },
    };

    static template = "ui_playground.ColorListStories";
    static codeTemplate = "ui_playground.ColorListCall";
    static components = { ColorList };
}

export const ColorListStories = {
    title: "Core components",
    module: "web",
    stories: [ColorListParent],
};

registry.category("stories").add("ui_playground.colorlist", ColorListStories);
