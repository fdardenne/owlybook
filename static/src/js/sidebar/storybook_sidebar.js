/** @odoo-module **/

const { Component, useState } = owl;

export class StorybookSidebar extends Component {
  setup() {
    this.stories = useState(this.props.stories);
    this.active = useState({ id: -1 });
  }

  /**
   * Show/hide the folder
   * @param {Object} folder - An object with a "folded" boolean property.
   */
  toggleFold(folder) {
    folder.folded = !folder.folded;
  }

  /**
   * Executes when a story is clicked in the sidebar. Update the active
   * id and sends the information to the parent.
   * @param {number} storyId - The id of the story that has been clicked
   */
  onStoryClick(storyId) {
    this.active.id = storyId;
    this.props.onStoryClick(storyId);
  }
}

StorybookSidebar.template = "storybook.StorybookSidebar";
