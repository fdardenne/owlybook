/** @odoo-module */

import { reactive, useState, useEnv, useSubEnv } from "@odoo/owl";

export function useStories() {
    const env = useEnv();
    return useState(env.stories);
}

export function setupStories(stories) {
    stories = new Stories(stories);
    useSubEnv({ stories })
    return useStories();
}

export class Stories {
    constructor(stories) {
        const self = reactive(this);
        self.setup(stories)
        return reactive(self);
    }

    setup(stories) {
        this.stories = stories;
        this.active = {};
    }

    setActive(story) {
        this.active = story;
    }
}
