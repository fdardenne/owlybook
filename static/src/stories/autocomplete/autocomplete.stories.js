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
            help: "ceci est un tooltip1",
        },
        sources: {
            default: [
                {
                    placeholder: "Loading...",
                    options: [{ label: "First choice" }, { label: "Second choice" }],
                },
            ],
            help: "ceci est un tooltip2",
        },
        placeholder: {
            default: "Search order by customer ...",
            dynamic: true,
            help: "ceci est un tooltip",
        },
        autoSelect: {
            default: false,
            help: "ceci est un tooltip",
        },
        onSelect: {
            default: () => console.log("Select event"),
            help: "ceci est un tooltip",
        },
        resetOnSelect: {
            default: true,
            dynamic: true,
            help: "ceci est un tooltip",
        },
    },
};

export const AutocompleteStories = {
    title: "Autocomplete",
    module: "web",
    stories: [storyA],
};

registry.category("stories").add("ui_playground.autocomplete", AutocompleteStories);
