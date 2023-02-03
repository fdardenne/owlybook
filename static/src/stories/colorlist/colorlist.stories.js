/** @odoo-module */
import { ColorList } from "@web/core/colorlist/colorlist";
import { registry } from "@web/core/registry";

const storyA = {
    title: "ColorListFirstStory",
    component: ColorList,
    props: {
        canToggle: {
            dynamic: true,
            default: true,
        },
        colors: {
            default: [0, 4, 5, 6, 7, 8],
        },
        forceExpanded: {
            dynamic: true,
            default: true,
        },
        isExpanded: {
            dynamic: true,
            default: true,
        },
        selectedColor: {
            dynamic: true,
            default: 0,
        },
        onColorSelected: {
             default: () => console.log("Select color"),
        },
    },
};

export const ColorListStories = {
    title: "ColorList",
    module: "web",
    stories: [storyA],
};

registry.category("stories").add("ui_playground.colorlist", ColorListStories);
