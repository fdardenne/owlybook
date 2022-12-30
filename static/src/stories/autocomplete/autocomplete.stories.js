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
            help: "Change the search options when clicking on the text area",
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
            help: "Function executed when we select an element of the search",
        },
        resetOnSelect: {
            default: true,
            dynamic: true,
            help: "Reset the input when clicking on a searched element",
        },
    },
};

export const AutocompleteStories = {
    title: "Autocomplete",
    module: "web",
    stories: [storyA],
};

registry.category("stories").add("ui_playground.autocomplete", AutocompleteStories);
