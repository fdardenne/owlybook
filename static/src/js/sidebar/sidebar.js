/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { useStories } from "../stories";

export class Sidebar extends Component {
    setup() {
        this.stories = useStories();
        this.filterName = "";
        this.map = this.getAllStories();
        this.all = this.getStoriesAndFolder();
        this.filteredStories = useState([...this.all[0]]);
        this.filteredFolders = useState([...this.all[1]]);
    }

    /**
     * Show/hide the folder.
     * @param {Object} folder - An object with a "folded" boolean property.
     */
    toggleFold(folder) {
        folder.folded = !folder.folded;
    }

    /**
     * Executes when a story is clicked in the sidebar. Sends the information to the parent.
     * @param {Object} story - The story that has been clicked.
     */
    onStoryClick(story) {
        this.stories.setActive(story);
    }

    /**
     * When a user write something in the searchbar, this function get the result used for the filtering.
     * @param {Object} ev - The element typed by the user.
     */
    onStoriesFilter(ev) {
        this.filterName = ev.target.value;
        this.filter(ev.target.value);
    }

    /**
     * This function iterate through the stories to create a Map that contains the folder has the key and a
     * list of stories has value.
     * @returns {Object} result - result is a Map following the structure {folder: [ story1, story2, ...]}
     */
    getAllStories() {
        const result = new Map();
        for (const name in this.stories.stories) {
            const folder = this.stories.stories[name];
            for (const folderName in folder) {
                const file = folder[folderName];
                for (const fileName in file) {
                    result.set(fileName, []);
                    const stories = file[fileName].stories;
                    for (let i = 0; i < stories.length; i++) {
                        const title = stories[i].title;
                        result.get(fileName).push(title);
                    }
                }
            }
        }
        return result;
    }

    /**
     * This function iterate through the map and add the element to the list res_stories and the set res_folder
     * @returns {Object} res_stories, res_folders - res_stories is a list of items and res_folder is a set of items
     */
    getStoriesAndFolder() {
        const res_stories = [];
        const res_folder = new Set();
        for (const [key, value] of this.map) {
            res_folder.add(key);
            res_stories.push(value);
        }
        return [res_stories.flat(), res_folder];
    }

    /**
     * This function will filter the stories and folder according to the searchString. filterStories and filterFolder
     * are then used to display only the result containing the searchString.
     * @param {Object} searchString - The element typed by the user.
     */
    filter(searchString) {
        this.filteredStories.splice(0, this.filteredStories.length);
        this.filteredFolders.splice(0, this.filteredFolders.length);
        for (const [key, value] of this.map) {
            for (const elem of value) {
                if (
                    elem.toLowerCase().includes(searchString.toLowerCase()) &&
                    !this.filteredStories.includes(elem)
                ) {
                    this.filteredStories.push(elem);
                    if (!this.filteredFolders.includes(key)) {
                        this.filteredFolders.push(key);
                    }
                }
            }
        }
    }

    showIntroduction() {
        this.stories.resetActive();
        window.history.pushState(null, "", "owlybook");
    }
}

Sidebar.template = "owlybook.Sidebar";
