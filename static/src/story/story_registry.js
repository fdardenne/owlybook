/**
 * The stories shown by Owlybook. A story only needs what can't be found in
 * the code:
 *
 *   // a component: its props, addon, import and template are read from it
 *   stories.add({ component: CheckBox, props: { value: true } });
 *
 *   // a view: the model is built from the arch, the records and the widgets
 *   stories.add({ title: "Sale order", arch: `<form>...</form>`, models: {...} });
 *
 *   // a field widget: a model and a value fitting the widget are generated
 *   stories.add({ widget: "statusbar" });
 *
 * Every field widget and view widget gets a generated story, a story added
 * for the same widget replaces it.
 */
import { markup } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { session } from "@web/session";
import { findExport } from "./module_lookup";

const storyRegistry = registry.category("owlybook_stories");

/**
 * Whether the stories of an addon are shown, see the `owlybook.addons` system
 * parameter: a list of addons, `*` matching anything (`["web", "hr", "hr_*"]`).
 * Without it, every addon is shown.
 */
export function isAddonShown(addon) {
    const patterns = session.owlybook_addons || [];
    return (
        !patterns.length ||
        patterns.some((pattern) =>
            new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`).test(addon)
        )
    );
}
const fieldRegistry = registry.category("fields");
const widgetRegistry = registry.category("view_widgets");

/**
 * @typedef {Object} StoryDefinition
 * @property {string} [title] defaults to the component name or the widget
 * @property {string} [folder] defaults to "Components", "Fields", "Widgets" or "Views"
 * @property {string} [addon] defaults to the addon of the component module
 * @property {string} [description] shown above the story, can contain HTML
 *
 * Component stories
 * @property {typeof import("@odoo/owl").Component} [component]
 * @property {Record<string, any>} [props] initial prop values
 * @property {Record<string, { help?: string, choices?: any[], readonly?: boolean, hidden?: boolean }>} [controls]
 *   refines the controls inferred from the props schema
 * @property {string} [template] renders the component inside a template, to
 *   give it slots: `<CheckBox t-props="this.props">Label</CheckBox>`
 * @property {Record<string, typeof import("@odoo/owl").Component>} [components]
 *   other components used by `template`
 * @property {boolean} [dialog] opens the component with the dialog service
 *   instead of rendering it in the page
 * @property {Record<string, string>} [sync] keeps a prop in sync with a
 *   callback: `{ onChange: "value" }` sets `value` to the first argument
 *   given to `onChange`
 *
 * View stories
 * @property {string} [arch]
 * @property {Record<string, Object>} [models] see mock_server/models.js
 * @property {string} [resModel] defaults to the first model
 * @property {number} [resId] defaults to the first record in a form view
 * @property {Object} [context]
 * @property {Array} [domain] the records a multi-record view shows
 *
 * Field widget stories
 * @property {string} [widget] key in the "fields" or "view_widgets" registry
 * @property {string} [fieldType] type of the field, defaults to the first
 *   type the widget supports
 * @property {any} [value] value of the field
 * @property {Record<string, string>} [attrs] attributes of the field node
 * @property {Record<string, any>} [options] options of the field node
 *
 * @property {Record<string, (params: Object, helpers: Object) => any>} [routes]
 *   answers of routes that are not ORM calls: `{ "/my/route": (params) => ({}) }`
 *
 * @property {boolean} [liveData] send the calls to the Odoo server instead of
 *   the mock server (the story can't be exported)
 */

export function slugify(text) {
    return String(text)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

/**
 * The addon of a widget: the module exporting its registry entry registers
 * it, then the one exporting its component, then the prefix of its template
 * ("mail.ActivityModelSelector"), for widgets defined inline.
 */
function getWidgetAddon(entry) {
    const source = findExport(entry) || (entry.component && findExport(entry.component));
    if (source) {
        return source.addon;
    }
    const template = entry.component?.template;
    if (typeof template === "string" && /^\w+\./.test(template)) {
        return template.split(".")[0];
    }
    return "web";
}

/**
 * @param {StoryDefinition} definition
 */
export function normalizeStory(definition) {
    const story = { ...definition };
    if (story.component) {
        const source = findExport(story.component);
        story.type = "component";
        story.title ||= story.component.name;
        story.addon ||= source?.addon || "unknown";
        story.folder ||= "Components";
        story.importPath = source?.moduleName;
        story.exportName = source?.exportName || story.component.name;
    } else if (story.widget) {
        const fieldEntry = fieldRegistry.get(story.widget, null);
        const entry = fieldEntry || widgetRegistry.get(story.widget, null);
        if (!entry) {
            throw new Error(`Owlybook: no field widget nor view widget named "${story.widget}"`);
        }
        story.type = "view";
        story.title ||= story.widget;
        story.addon ||= getWidgetAddon(entry);
        story.folder ||= fieldEntry ? "Fields" : "Widgets";
    } else if (story.arch) {
        story.type = "view";
        story.addon ||= "web";
        story.folder ||= "Views";
    } else {
        throw new Error("Owlybook: a story needs a `component`, an `arch` or a `widget`");
    }
    if (!story.title) {
        throw new Error("Owlybook: a view story needs a `title`");
    }
    // Written by developers in their stories, like a template.
    story.descriptionMarkup = story.description ? markup(story.description) : "";
    story.id = [story.addon, story.folder, story.title].map(slugify).join("/");
    return story;
}

export const stories = {
    /**
     * @param {StoryDefinition} definition
     * @returns {string} the id of the story
     */
    add(definition) {
        const story = normalizeStory(definition);
        storyRegistry.add(story.id, story, { force: true });
        return story.id;
    },

    get(id) {
        return storyRegistry.get(id, null);
    },

    has(id) {
        return storyRegistry.contains(id);
    },

    /** The stories of the shown addons. */
    getAll() {
        return storyRegistry.getAll().filter((story) => isAddonShown(story.addon));
    },

    /**
     * Stories grouped by addon then by folder, sorted by name.
     *
     * @returns {{ addon: string, folders: { name: string, stories: Object[] }[] }[]}
     */
    getTree() {
        const byAddon = new Map();
        for (const story of this.getAll()) {
            if (!byAddon.has(story.addon)) {
                byAddon.set(story.addon, new Map());
            }
            const folders = byAddon.get(story.addon);
            if (!folders.has(story.folder)) {
                folders.set(story.folder, []);
            }
            folders.get(story.folder).push(story);
        }
        const byName = (a, b) => a.localeCompare(b);
        return [...byAddon.keys()].sort(byName).map((addon) => ({
            addon,
            folders: [...byAddon.get(addon).keys()].sort(byName).map((name) => ({
                name,
                stories: byAddon
                    .get(addon)
                    .get(name)
                    .sort((a, b) => byName(a.title, b.title)),
            })),
        }));
    },
};
