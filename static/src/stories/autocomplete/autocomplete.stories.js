/** @odoo-module */

import { AutoComplete } from "@web/core/autocomplete/autocomplete";
import { registry } from "@web/core/registry";
const { Component, xml } = owl;

class StoryA extends Component {
    static template = xml`
        <AutoComplete
            value="''"
            sources="sources"
            placeholder="'Search order by customer ...'"
            autoSelect="false"
            onSelect.bind="onSelect"
        />
    `;
    static components = { AutoComplete };
    static title = "Autocomplete";

    get sources() {
        return [
            {
                placeholder: "Loading...",
                options: [{ label: "First choice" }, { label: "Second choice" }],
            },
        ];
    }

    onSelect(option) {
        console.log(`${option.label} selected`);
    }
}

export const AutocompleteStories = {
    title: "Autocomplete",
    module: "web",
    stories: [StoryA],
};

registry.category("stories").add("storybook.autocomplete", AutocompleteStories);
