/**
 * The live state of the story being shown: the values of its controls, the
 * events it triggered and, for a view, its arch and its fake database. The
 * preview renders from it and the panel edits it.
 */
import { computed, markRaw, proxy, signal } from "@odoo/owl";
import { MockServer } from "../mock_server/mock_server";
import { getArchNodes, setArchControlValue } from "./arch_controls";
import { describeProps, makeSampleValue } from "./props_schema";
import { buildWidgetStory, completeModelsFromArch, getSampleModels, MAIN_MODEL } from "./widget_stories";

const MAX_EVENTS = 200;

/**
 * Optional function props that look like callbacks get a function logging
 * their calls. Others (a component class, a formatter...) keep their default.
 */
const CALLBACK_NAME = /^(on[A-Z_]|close$|confirm$|cancel$|discard$|update$|select$|save$|remove$|delete$|apply$)/;

class StoryRuntime {
    /**
     * @param {Object} story a normalized story
     */
    constructor(story) {
        this.story = story;
        this.events = proxy([]);
        /** Changing it renders the story again from scratch. */
        this.renderKey = signal(0);
        /** The error the story raised while rendering, if any. */
        this.error = signal(null);
    }

    /**
     * @param {string} name
     * @param {any[]} args
     * @param {string[]} [labels] names of the arguments, "arg0"... by default
     */
    logEvent(name, args, labels = []) {
        this.events.unshift(markRaw({ name, args: markRaw([...args]), labels, time: new Date() }));
        if (this.events.length > MAX_EVENTS) {
            this.events.length = MAX_EVENTS;
        }
    }

    clearEvents() {
        this.events.length = 0;
    }

    rerender() {
        this.error.set(null);
        this.renderKey.set(this.renderKey() + 1);
    }
}

export class ComponentStoryRuntime extends StoryRuntime {
    type = "component";

    /**
     * @param {Object} story
     * @param {Object} [savedState] values of an exported story
     */
    constructor(story, savedState) {
        super(story);
        /** @type {Record<string, import("./props_schema").PropDescription> | null} */
        this.descriptions = signal(null);
        this.values = proxy({});
        // Components may call the ORM: keep those calls away from the database.
        this.server = new MockServer({ ...getSampleModels(), ...story.models }, { routes: story.routes });
        this.initialValues = { ...story.props, ...savedState?.values };
        this.reset();
    }

    reset() {
        for (const key of Object.keys(this.values)) {
            delete this.values[key];
        }
        for (const [name, value] of Object.entries(this.initialValues)) {
            this.values[name] = typeof value === "function" ? this.makeCallback(name, value) : value;
        }
        for (const name of Object.keys(this.story.sync || {})) {
            this.values[name] ??= this.makeCallback(name);
        }
        if (this.descriptions()) {
            this.completeValues();
        }
        this.clearEvents();
        this.rerender();
    }

    /**
     * Builds the function given to a callback prop: it logs the call, keeps
     * the synced prop up to date, then calls the function of the story.
     */
    makeCallback(name, storyFunction) {
        const callback = (...args) => {
            this.logEvent(name, args);
            const syncedProp = this.story.sync?.[name];
            if (syncedProp) {
                this.values[syncedProp] = args[0];
            }
            return storyFunction?.call(this.values, ...args);
        };
        callback.isOwlybookCallback = true;
        return markRaw(callback);
    }

    /**
     * Called with each schema the component gives to `useProps`.
     *
     * @returns {boolean} whether values were added
     */
    setSchema(schema) {
        const descriptions = describeProps(schema);
        delete descriptions.slots;
        // A component can call useProps several times (DateTimeInput does):
        // each call declares more props.
        const known = this.descriptions() || {};
        if (Object.keys(descriptions).every((name) => name in known)) {
            return false;
        }
        this.descriptions.set({ ...known, ...descriptions });
        return this.completeValues();
    }

    /**
     * Gives a value to the props the story doesn't set: callbacks log their
     * calls and required props get a value of their type.
     */
    completeValues() {
        let changed = false;
        for (const [name, description] of Object.entries(this.descriptions())) {
            if (this.values[name] !== undefined) {
                continue;
            }
            const isCallback =
                (description.kind === "function" && (!description.optional || CALLBACK_NAME.test(name))) ||
                // `t.any()` says nothing: trust the name
                (description.kind === "any" && CALLBACK_NAME.test(name));
            if (isCallback) {
                this.values[name] = this.makeCallback(name);
                changed = true;
            } else if (!description.optional) {
                const value = makeSampleValue(description);
                if (value !== undefined) {
                    this.values[name] = value;
                    changed = true;
                }
            }
        }
        return changed;
    }

    /**
     * @returns {{ name: string, description: Object, control: Object, value: any }[]}
     */
    getControls() {
        const descriptions = this.descriptions() || {};
        const names = new Set([...Object.keys(descriptions), ...Object.keys(this.values)]);
        const result = [];
        for (const name of names) {
            const control = this.story.controls?.[name] || {};
            if (control.hidden || name === "slots") {
                continue;
            }
            const description = descriptions[name] || { kind: "any", optional: true };
            result.push({ name, description, control, value: this.values[name] });
        }
        return result;
    }

    setValue(name, value) {
        this.values[name] = value;
        if (this.error()) {
            this.rerender();
        }
    }

    /** The props given to the component. */
    getProps() {
        const props = {};
        for (const [name, value] of Object.entries(this.values)) {
            if (value !== undefined) {
                props[name] = value;
            }
        }
        return props;
    }

    /** What an exported story needs to show the same state. */
    exportState() {
        const values = {};
        for (const [name, value] of Object.entries(this.values)) {
            if (typeof value !== "function" && value !== undefined) {
                values[name] = value;
            }
        }
        return JSON.parse(JSON.stringify({ values }));
    }
}

export class ViewStoryRuntime extends StoryRuntime {
    type = "view";

    constructor(story, savedState) {
        super(story);
        const built = story.widget ? buildWidgetStory(story) : this.buildArchStory(story);
        this.initialArch = built.arch.trim();
        this.models = built.models;
        this.resModel = built.resModel;
        this.resId = built.resId;
        this.viewType = this.getViewType(this.initialArch);
        this.arch = signal(savedState?.arch || this.initialArch);
        this.server = null;
        this.resetServer();
        this.initialSearchArch = (story.searchArch || this.server.getArch(this.server.models[this.resModel], "search")).trim();
        this.searchArch = signal(savedState?.searchArch || this.initialSearchArch);
        /** Whether the view shows its control panel: buttons, search, pager. */
        this.hasControlPanel = signal(savedState?.hasControlPanel ?? story.display?.controlPanel !== false);
        this.nodes = computed(() => getArchNodes(this.arch(), this.server.models, this.resModel));
    }

    buildArchStory(story) {
        const resModel = story.resModel || Object.keys(story.models || {})[0] || MAIN_MODEL;
        const models = completeModelsFromArch(story.arch, story.models || {}, resModel);
        const resId = story.resId ?? models[resModel].records?.[0]?.id ?? false;
        return { arch: story.arch, models, resModel, resId };
    }

    getViewType(arch) {
        const tag = /^\s*<(\w+)/.exec(arch)?.[1];
        return tag === "tree" ? "list" : tag;
    }

    resetServer() {
        this.server = new MockServer(this.models, {
            routes: this.story.routes,
            onCall: ({ model, method, args, kwargs }) => {
                const { context, ...otherKwargs } = kwargs;
                this.logEvent(`${model}.${method}`, [args, otherKwargs], ["args", "kwargs"]);
            },
        });
    }

    reset() {
        this.arch.set(this.initialArch);
        this.searchArch.set(this.initialSearchArch);
        this.resetServer();
        this.clearEvents();
        this.rerender();
    }

    setArch(arch) {
        const tag = this.getViewType(arch);
        if (tag) {
            this.viewType = tag;
        }
        this.error.set(null);
        this.arch.set(arch);
    }

    setSearchArch(searchArch) {
        this.error.set(null);
        this.searchArch.set(searchArch);
    }

    toggleControlPanel() {
        this.hasControlPanel.set(!this.hasControlPanel());
        this.rerender();
    }

    setControlValue(nodeIndex, control, value) {
        this.setArch(setArchControlValue(this.arch(), nodeIndex, control, value));
    }

    exportState() {
        return { arch: this.arch(), searchArch: this.searchArch(), hasControlPanel: this.hasControlPanel() };
    }
}

/**
 * @param {Object} story
 * @param {Object} [savedState]
 */
export function createStoryRuntime(story, savedState) {
    return story.type === "component"
        ? new ComponentStoryRuntime(story, savedState)
        : new ViewStoryRuntime(story, savedState);
}
