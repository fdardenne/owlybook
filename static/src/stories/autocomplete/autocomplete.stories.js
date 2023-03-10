/** @odoo-module */

import { Component } from "@odoo/owl";
import { AutoComplete } from "@web/core/autocomplete/autocomplete";
import { registry } from "@web/core/registry";
import { getEventFunction } from "../utils/utils";

class AutoCompleteParent extends Component {
    static template = "ui_playground.AutoCompleteStories";
    static components = { AutoComplete };
}

AutoCompleteParent.codeTemplate = "ui_playground.AutoCompleteCall";
AutoCompleteParent.storyConfig = {
    title: "Autocomplete",
    component: AutoComplete,
    props: {
        sources: {
            value: [
                {
                    placeholder: "Loading...",
                    options: [{ label: "First choice" }, { label: "Second choice" }],
                },
            ],
            help: "Change the search options when clicking on the text area",
        },
        placeholder: {
            value: "Search order by customer ...",
        },
        autoSelect: {
            value: false,
        },
        onSelect: {
            value: getEventFunction("onSelect"),
            help: "Function executed when we select an element of the search",
        },
        onInput: {
            value: getEventFunction("onInput"),
        },
        onChange: {
            value: getEventFunction("onChange"),
        },
        onFocus: {
            value: getEventFunction("onFocus"),
        },
        resetOnSelect: {
            value: true,
            help: "Reset the input when clicking on a searched element",
        },
    },
};

export const AutocompleteStories = {
    title: "Core components",
    module: "web",
    stories: [AutoCompleteParent],
};

registry.category("stories").add("ui_playground.autocomplete", AutocompleteStories);
