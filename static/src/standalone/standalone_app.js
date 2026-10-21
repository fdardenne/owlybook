import { Component } from "@odoo/owl";
import { MainComponentsContainer } from "@web/core/main_components_container";
import { StoryPanel } from "../panel/story_panel";
import { StoryPreview } from "../preview/story_preview";
import { startOwlybook } from "../story/boot";
import { createStoryRuntime } from "../story/story_runtime";
import { stories } from "../story/story_registry";
import { addWidgetStories } from "../story/widget_stories";

/**
 * Root of an exported story: the story, in the state it was exported in, and
 * its controls if they were exported too.
 */
export class StandaloneApp extends Component {
    static template = "owlybook.StandaloneApp";
    static components = { MainComponentsContainer, StoryPanel, StoryPreview };

    setup() {
        // Here and not earlier: their descriptions need the translations.
        addWidgetStories();
        const { id, state } = JSON.parse(document.getElementById("owlybook_story").textContent);
        const story = stories.get(id);
        this.storyId = id;
        this.withControls = Boolean(state.withControls);
        this.runtime = story ? createStoryRuntime(story, state) : null;
    }
}

startOwlybook(StandaloneApp, { offline: true });
