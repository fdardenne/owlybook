/** @odoo-module */

import { reactive, useState, useEnv, useSubEnv } from "@odoo/owl";
import { registry } from "@web/core/registry";

const storiesRegistry = registry.category("stories");

export function useStories() {
    const env = useEnv();
    return useState(env.stories);
}

export function setupStories() {
    const stories = new Stories();
    const storyRegistry = storiesRegistry.getAll().sort(function(a, b) {
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
    constructor() {
        const self = reactive(this);
        self.setup();
        return self;
    }

    setup() {
        this.stories = {};
        this.active = {};
        this.counter = 0;
    }

    setActive(story) {
        this.active = story;
        if (!this.active.arch) {
            this.setupProps(story);
        }
    }

    resetActive() {
        this.active = {};
    }

    addStory(moduleName, folder, story) {
        if (!(moduleName in this.stories)) {
            this.stories[moduleName] = { folders: {} };
        }
        if (!(folder in this.stories[moduleName]["folders"])) {
            this.stories[moduleName]["folders"][folder] = { stories: [] };
        }
        this.stories[moduleName]["folders"][folder].stories.push({
            id: this.counter++,
            ...story,
        });
    }

    setupProps(story) {
        // Props static definition
        const propsDefinition = story.component.props;
        // props story configuration
        const propsStoryConfig = story.props;
        story.processedProps = {};

        for (const [propName, value] of Object.entries(propsDefinition)) {
            story.processedProps[propName] = {};
            const propsStoryObject = story.processedProps[propName];
            propsStoryObject.type = value.type;
            propsStoryObject.value = value.default;
            propsStoryObject.optional = value.optional || false;

            if (propsStoryConfig && propName in propsStoryConfig) {
                propsStoryObject.dynamic = propsStoryConfig[propName].dynamic || false;
                propsStoryObject.help = propsStoryConfig[propName].help || false;
                if ("default" in propsStoryConfig[propName]) {
                    propsStoryObject.value = propsStoryConfig[propName].default;
                }
            }
        }
    }
}
