/** @odoo-module */

import { reactive, useState, useEnv, useSubEnv } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { attrsToXml, arrayToSelectMenuArray } from "./utils";
const storiesRegistry = registry.category("stories");
let stories = undefined;

export function getStories() {
    return stories;
}

export function useStories() {
    const env = useEnv();
    return useState(env.stories);
}

export function setupStories(router) {
    stories = new Stories(router);
    const storyRegistry = storiesRegistry.getAll().sort(function (a, b) {
        return a.title.localeCompare(b.title);
    });
    for (const storyCategory of storyRegistry) {
        for (const story of storyCategory.stories) {
            stories.addStory(storyCategory.module, storyCategory.title, story);
        }
    }
    useSubEnv({ stories });
    return useStories();
}

export class Stories {
    constructor(router) {
        const self = reactive(this);
        self.setup(router);
        return self;
    }

    setup(router) {
        this.stories = {};
        this.active = {};
        this.counter = 0;
        this.router = router;
    }

    /**
     * Set the story passed in parameter as active.
     * The active story is read by the UI Playground to know which story to render.
     * Also deal with custom URL
     * @param {Object} story
     */
    setActive(story) {
        this.active = story;
        this.active.events = [];
        if (!this.active.arch) {
            this.setupProps(story);
        } else if (this.active.attrs) {
            this.setupAttrs(story);
        }
        this.setUrl(story);
    }

    /**
     * The goal of this function is to set the URL so that it matches the stories the user is checking
     * Also deal with go back function of the browser so that when pressing the button the last story become active
     * @param {Object} story
     */
    setUrl(story) {
        const { moduleName, folder, title } = story;
        this.router.pushState({ module: moduleName, folder, title });
    }

    /**
     * The goal of this function is to search and get a story by giving the name in argument.
     * @param {Object} params
     */
    getStoryByDescription({ module, folder, title }) {
        const stories = this.stories[module]["folders"][folder].stories;
        for (const currentStory of stories) {
            if (currentStory.title === title) {
                return currentStory;
            }
        }
    }

    resetActive() {
        this.active = {};
    }

    /**
     * Add the story in the this.stories datastructure
     * @param {String} moduleName
     * @param {String} folder
     * @param {Object} story
     */
    addStory(moduleName, folder, story) {
        if (!(moduleName in this.stories)) {
            this.stories[moduleName] = { folders: {} };
        }
        if (!(folder in this.stories[moduleName]["folders"])) {
            this.stories[moduleName]["folders"][folder] = { stories: [] };
        }
        this.stories[moduleName]["folders"][folder].stories.push({
            id: this.counter++,
            moduleName,
            folder,
            ...story,
        });
    }

    /**
     * Loop through the props definition of the component, the props options of the stories
     * and populate the processedProps of the story. The processedProps will be read and updated by
     * the Props component (panel) and read by the ComponentRenderer (canvas)
     * @param {Object} story
     */
    setupProps(story) {
        // Props static definition
        const propsDefinition = story.component.props;
        const propsDefinitionDefault = story.component.defaultProps || [];
        // props story configuration
        const propsStoryConfig = story.props;
        story.processedProps = {};

        for (const [propName, value] of Object.entries(propsDefinition)) {
            story.processedProps[propName] = {};
            const propsStoryObject = story.processedProps[propName];
            propsStoryObject.type = value.type;
            propsStoryObject.value = propsDefinitionDefault[propName];
            propsStoryObject.optional = value.optional || false;

            if (propsStoryConfig && propName in propsStoryConfig) {
                propsStoryObject.dynamic = propsStoryConfig[propName].dynamic || false;
                propsStoryObject.help = propsStoryConfig[propName].help || false;
                propsStoryObject.choices = arrayToSelectMenuArray(
                    propsStoryConfig[propName].choices
                );
                if ("default" in propsStoryConfig[propName]) {
                    propsStoryObject.value = propsStoryConfig[propName].default;
                }
            }
        }
    }

    /**
     * Build the `processedAttrs` of the story. `processedAttrs` contains the attributes shown in
     * the bottom panel for the modification of view attribute. This method is needed to manipulate
     * subAttributes such as the `options` attribute in many2one.
     * @param {Object} story
     */
    setupAttrs(story) {
        const attrsStoryConfig = story.attrs;
        story.processedAttrs = {};

        for (const [attrsName, value] of Object.entries(attrsStoryConfig)) {
            if (value.subAttrs) {
                for (const [subName, subValue] of Object.entries(attrsStoryConfig[attrsName])) {
                    if (subName !== "subAttrs") {
                        story.processedAttrs[`${attrsName}.${subName}`] = subValue;
                        story.processedAttrs[`${attrsName}.${subName}`].choices =
                            arrayToSelectMenuArray(
                                story.processedAttrs[`${attrsName}.${subName}`].choices
                            );
                    }
                }
            } else {
                story.processedAttrs[attrsName] = value;
            }
        }
    }

    /**
     * Read the attrs defined by the stories and return a processed arch that reflects the user
     * choices. If the user did modify the arch manually, then the manually modified arch is
     * returned.
     * @returns the active processed arch
     */
    get activeArch() {
        if (this.active.modifiedArch) {
            return this.active.modifiedArch;
        }

        const toInject = attrsToXml(this.active.processedAttrs);
        return this.active.arch.replace("{{attrs}}", toInject);
    }
}
