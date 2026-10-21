import { Component, computed, onWillDestroy, proxy, untrack, useListener } from "@odoo/owl";
import { browser } from "@web/core/browser/browser";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";
import { MainComponentsContainer } from "@web/core/main_components_container";
import { download } from "@web/core/network/download";
import { StoryPanel } from "../panel/story_panel";
import { StoryPreview } from "../preview/story_preview";
import { owlybookMode } from "../story/boot";
import { createStoryRuntime } from "../story/story_runtime";
import { stories } from "../story/story_registry";
import { addWidgetStories } from "../story/widget_stories";
import { Sidebar } from "./sidebar";

export const VIEWPORTS = [
    { id: "full", label: "Full", title: "Full width", width: null },
    { id: "tablet", label: "768", title: "Tablet width (768px)", width: 768 },
    { id: "mobile", label: "390", title: "Mobile width (390px)", width: 390 },
];

export const BACKGROUNDS = [
    { id: "webclient", label: "Web client" },
    { id: "plain", label: "Plain" },
    { id: "grid", label: "Grid" },
];

const PANEL_MIN_HEIGHT = 120;
const STORAGE_KEY = "owlybook.layout";

function readStoryIdFromHash() {
    const params = new URLSearchParams(browser.location.hash.slice(1));
    return params.get("story") || null;
}

function loadLayout() {
    try {
        return JSON.parse(browser.localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

export class OwlybookApp extends Component {
    static template = "owlybook.App";
    static components = { Dropdown, DropdownItem, MainComponentsContainer, Sidebar, StoryPanel, StoryPreview };

    setup() {
        // Here and not earlier: their descriptions need the translations.
        addWidgetStories();
        const layout = loadLayout();
        const storyId = readStoryIdFromHash();
        this.state = proxy({
            storyId,
            viewport: layout.viewport || "full",
            background: layout.background || "webclient",
            panelHeight: layout.panelHeight || 320,
            // On small screens the sidebar covers the story.
            isSidebarOpen: !storyId || browser.innerWidth >= 992,
        });
        this.tree = stories.getTree();
        this.storyCount = stories.getAll().length;
        this.runtime = computed(() => {
            const story = this.state.storyId && stories.get(this.state.storyId);
            // The runtime reads its own signals while it is built: they must
            // not rebuild it.
            return story ? untrack(() => createStoryRuntime(story)) : null;
        });
        useListener(browser, "hashchange", () => {
            this.state.storyId = readStoryIdFromHash();
        });
        this.isOffline = owlybookMode.offline;
        this.viewports = VIEWPORTS;
        this.backgrounds = BACKGROUNDS;
        onWillDestroy(() => this.saveLayout());
    }

    getStory() {
        return this.runtime()?.story;
    }

    selectStory(storyId) {
        browser.location.hash = storyId ? `story=${storyId}` : "";
        this.state.storyId = storyId;
        if (browser.innerWidth < 992) {
            this.state.isSidebarOpen = false;
        }
    }

    setViewport(viewportId) {
        this.state.viewport = viewportId;
        this.saveLayout();
    }

    setBackground(backgroundId) {
        this.state.background = backgroundId;
        this.saveLayout();
    }

    saveLayout() {
        const { viewport, background, panelHeight } = this.state;
        try {
            browser.localStorage.setItem(STORAGE_KEY, JSON.stringify({ viewport, background, panelHeight }));
        } catch {
            // Private browsing: the layout isn't remembered, that's fine.
        }
    }

    getCanvasStyle() {
        const width = VIEWPORTS.find((v) => v.id === this.state.viewport)?.width;
        return width ? `max-width: ${width}px;` : "";
    }

    getStoryPath() {
        const story = this.getStory();
        return story ? [story.addon, story.folder] : [];
    }

    // -------------------------------------------------------------------------
    // Panel resizing
    // -------------------------------------------------------------------------

    onResizeStart(ev) {
        ev.preventDefault();
        const startY = ev.clientY;
        const startHeight = this.state.panelHeight;
        const maxHeight = browser.innerHeight - 160;
        const onMove = (moveEv) => {
            const height = startHeight + startY - moveEv.clientY;
            this.state.panelHeight = Math.min(maxHeight, Math.max(PANEL_MIN_HEIGHT, height));
        };
        const onUp = () => {
            browser.removeEventListener("pointermove", onMove);
            browser.removeEventListener("pointerup", onUp);
            document.body.classList.remove("o_owlybook_resizing");
            this.saveLayout();
        };
        document.body.classList.add("o_owlybook_resizing");
        browser.addEventListener("pointermove", onMove);
        browser.addEventListener("pointerup", onUp);
    }

    // -------------------------------------------------------------------------
    // Export
    // -------------------------------------------------------------------------

    /**
     * Downloads the story, as currently configured, as an HTML page that
     * works without any server.
     */
    /**
     * Downloads the whole Owlybook as a single HTML page working without any
     * server, to publish as a static site.
     */
    async exportSite() {
        await download({ url: "/owlybook/export_site", data: {} });
    }

    async exportStory({ withControls }) {
        const runtime = this.runtime();
        const state = { ...runtime.exportState(), withControls };
        await download({
            url: "/owlybook/export",
            data: {
                story: runtime.story.id,
                state: JSON.stringify(state),
                filename: `${runtime.story.title} story`,
            },
        });
    }
}
