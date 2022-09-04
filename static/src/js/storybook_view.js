/* @odoo-module */

import { registry } from "@web/core/registry";
import { StorybookSidebar } from "./sidebar/storybook_sidebar";
const { Component } = owl;
class StorybookView extends Component {
  setup() {
    this.stories = stories;
  }
  /**
   * Load the story to the canvas
   * @param {number} storyId - id of a story
   */
  loadStory(storyId) {
    console.log(`loading story #${storyId}`);
  }
}

StorybookView.template = "storybook.StorybookView";
StorybookView.components = { StorybookSidebar };

registry.category("actions").add("storybook_view", StorybookView);

const stories = {
  "Module 1": {
    folders: {
      Views: {
        stories: [
          { id: 1, name: "Story 1" },
          { id: 2, name: "Story 2" },
          { id: 3, name: "Story 3" },
        ],
        folded: false,
      },
      Widget: {
        stories: [
          { id: 4, name: "Story 4" },
          { id: 5, name: "Story 5" },
          { id: 6, name: "Story 6" },
        ],
        folded: false,
      },
    },
    folded: false,
  },
  "Module 2": {
    folders: {
      Views: {
        stories: [
          { id: 7, name: "Story 1" },
          { id: 8, name: "Story 2" },
          { id: 9, name: "Story 3" },
        ],
        folded: false,
      },
      Widget: {
        stories: [
          { id: 10, name: "Story 4" },
          { id: 11, name: "Story 5" },
          { id: 12, name: "Story 6" },
        ],
        folded: false,
      },
    },
    folded: false,
  },
  "Module 3": {
    folders: {
      Views: {
        stories: [
          { id: 13, name: "Story 1" },
          { id: 14, name: "Story 2" },
          { id: 15, name: "Story 3" },
        ],
        folded: false,
      },
      Widget: {
        stories: [
          { id: 16, name: "Story 4" },
          { id: 17, name: "Story 5" },
          { id: 18, name: "Story 6" },
        ],
        folded: false,
      },
    },
    folded: false,
  },
};
