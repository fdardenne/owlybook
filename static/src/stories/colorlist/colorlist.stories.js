/** @odoo-module */
import { ColorList } from "@web/core/colorlist/colorlist";
import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
import { getEventFunction } from "../utils/utils";

class ColorListParent extends Component {
    static template = "owlybook.ColorListStories";
    static components = { ColorList };
}
ColorListParent.codeTemplate = "owlybook.ColorListCall";
ColorListParent.storyConfig = {
    title: "ColorList",
    component: ColorList,
    props: {
        canToggle: {
            value: true,
        },
        colors: {
            value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        },
        isExpanded: {
            value: true,
        },
        selectedColor: {
            value: 9,
        },
        onColorSelected: {
            value: getEventFunction("onColorSelected"),
        },
    },
};

export const ColorListStories = {
    title: "Core components",
    module: "web",
    stories: [ColorListParent],
};

registry.category("stories").add("owlybook.colorlist", ColorListStories);
