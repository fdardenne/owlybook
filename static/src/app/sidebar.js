import { Component, proxy, t, useProps } from "@odoo/owl";

/**
 * The tree of stories: addons, folders and stories, with a search.
 */
export class Sidebar extends Component {
    static template = "owlybook.Sidebar";

    props = useProps({
        tree: t.array(),
        activeStoryId: t.string().optional(),
        onSelect: t.function(),
        onShowWelcome: t.function(),
    });

    setup() {
        this.state = proxy({ search: "", openFolders: {} });
    }

    getFolderKey(addon, folder) {
        return `${addon}/${folder.name}`;
    }

    isFolderOpen(addon, folder) {
        if (this.state.search) {
            return true;
        }
        const key = this.getFolderKey(addon, folder);
        if (key in this.state.openFolders) {
            return this.state.openFolders[key];
        }
        return folder.stories.some((story) => story.id === this.props.activeStoryId);
    }

    toggleFolder(addon, folder) {
        const key = this.getFolderKey(addon, folder);
        this.state.openFolders[key] = !this.isFolderOpen(addon, folder);
    }

    /**
     * The tree restricted to the stories matching the search, on their title,
     * folder or addon.
     */
    getFilteredTree() {
        const words = this.state.search.toLowerCase().split(/\s+/).filter(Boolean);
        if (!words.length) {
            return this.props.tree;
        }
        const result = [];
        for (const addon of this.props.tree) {
            const folders = [];
            for (const folder of addon.folders) {
                const stories = folder.stories.filter((story) => {
                    const text = `${story.title} ${folder.name} ${addon.addon}`.toLowerCase();
                    return words.every((word) => text.includes(word));
                });
                if (stories.length) {
                    folders.push({ ...folder, stories });
                }
            }
            if (folders.length) {
                result.push({ ...addon, folders });
            }
        }
        return result;
    }

    getStoryIcon(story) {
        if (story.type === "component") {
            return "widgets";
        }
        return story.widget ? "text_fields" : "article";
    }

    onSearchKeydown(ev) {
        if (ev.key === "Escape") {
            this.state.search = "";
        }
    }
}
