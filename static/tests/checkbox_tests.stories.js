import { Component } from "@odoo/owl";
import { CheckBox } from "@web/core/checkbox/checkbox";
import { registry } from "@web/core/registry";
import { getEventFunction } from "../src/js/stories";

class CheckBoxParentTest extends Component {
    static template = "owlybook.CheckBoxStoriesTest";
    static components = { CheckBox };
}

CheckBoxParentTest.codeTemplate = "owlybook.CheckBoxCallTest";
CheckBoxParentTest.storyConfig = {
    title: "CheckboxFirstStory",
    component: CheckBox,
    props: {
        value: {
            value: true,
        },
        className: {
            value: "form-switch",
        },
        name: {
            value: "beautiful_name",
            help: "tooltip test",
        },
        onChange: {
            value: getEventFunction("onChange"),
            help: "Called when the user clicked on the checkbox",
        },
    },
};

class CheckBoxParentTest2 extends Component {
    static template = "owlybook.CheckBoxStoriesTest";
    static components = { CheckBox };
}

CheckBoxParentTest2.codeTemplate = "owlybook.CheckBoxCallTest";
CheckBoxParentTest2.storyConfig = {
    title: "CheckboxSecondStory",
    component: CheckBox,
    props: {
        value: {
            value: true,
        },
        className: {
            value: "form-switch",
        },
        name: {
            value: "beautiful_name",
            help: "tooltip test",
        },
        onChange: {
            value: getEventFunction("onChange"),
            help: "Called when the user clicked on the checkbox",
        },
    },
};

export const CheckBoxStories = {
    title: "Core components",
    module: "web",
    stories: [CheckBoxParentTest, CheckBoxParentTest2],
};

export const CheckBoxStories2 = {
    title: "Core components2",
    module: "web",
    stories: [CheckBoxParentTest],
};
registry.category("stories").add("owlybook.checkbox", CheckBoxStories);
registry.category("stories").add("owlybook.checkbox2", CheckBoxStories2);
