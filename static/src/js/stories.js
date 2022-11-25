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
    const storyRegistry = storiesRegistry.getAll();
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
        return reactive(self);
    }

    setup() {
        this.stories = {};
        this.active = {};
        this.counter = 0;
    }

    setActive(story) {
        this.active = story;
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
            name: story.title,
            component: story,
        });
    }
}
