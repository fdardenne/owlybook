/** @odoo-module */

import { AutoComplete } from "@web/core/autocomplete/autocomplete";
import { registry } from "@web/core/registry";

const storyA = {
    title: "Autocomplete",
    component: AutoComplete,
    props: {
        value: {
            default: "",
            dynamic: true,
        },
        sources: {
            default: [
                {
                    placeholder: "Loading...",
                    options: [{ label: "First choice" }, { label: "Second choice" }],
                },
            ],
        },
        placeholder: {
            default: "Search order by customer ...",
            dynamic: true,
        },
        autoSelect: {
            default: false,
        },
        onSelect: {
            default: () => console.log("Select event"),
        },
        resetOnSelect: {
            default: true,
            dynamic: true,
        },
    },
};

export const AutocompleteStories = {
    title: "Autocomplete",
    module: "web",
    stories: [storyA],
};

registry.category("stories").add("ui_playground.autocomplete", AutocompleteStories);
