/** @odoo-module */

import { Component } from "@odoo/owl";
import { AutoComplete } from "@web/core/autocomplete/autocomplete";
import { registry } from "@web/core/registry";
import { getEventFunction } from "../utils/utils";

class AutoCompleteParent extends Component {
    static storyConfig = {
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
                dynamic: true,
            },
            onSelect: {
                default: getEventFunction("onSelect"),
                help: "Function executed when we select an element of the search",
            },
            onInput: {
                default: getEventFunction("onInput"),
            },
            onChange: {
                default: getEventFunction("onChange"),
            },
            onFocus: {
                default: getEventFunction("onFocus"),
            },
            resetOnSelect: {
                default: true,
                dynamic: true,
                help: "Reset the input when clicking on a searched element",
            },
        },
    };

    static template = "ui_playground.AutoCompleteStories";
    static codeTemplate = "ui_playground.AutoCompleteCall";
    static components = { AutoComplete };
}

export const AutocompleteStories = {
    title: "Core components",
    module: "web",
    stories: [AutoCompleteParent],
};

registry.category("stories").add("ui_playground.autocomplete", AutocompleteStories);
