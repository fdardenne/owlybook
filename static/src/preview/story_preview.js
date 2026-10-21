import { Component, onWillDestroy, signal, t, untrack, useEffect, useProps, useScope, xml } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { ErrorHandler } from "@web/core/utils/components";
import { useSubEnv } from "@web/owl2/utils";
import { getDefaultConfig, View } from "@web/views/view";
import { releaseMockServer, setMockServer } from "../mock_server/rpc_interceptor";
import { onPropsDeclared } from "../props_capture";

/**
 * Whether `scope` is rendered inside `ancestor`.
 */
function isInside(scope, ancestor) {
    let current = scope.parent;
    while (current) {
        if (current === ancestor) {
            return true;
        }
        current = current.parent;
    }
    return false;
}

/**
 * Sets the mock server of the story for the lifetime of the component.
 */
function useMockServer(runtime) {
    const owner = {};
    setMockServer(runtime.story.liveData ? null : runtime.server, owner);
    onWillDestroy(() => releaseMockServer(owner));
}

/**
 * Renders a story inside a template, which gives the component a parent and
 * slots: `<CheckBox t-props="this.props">Label</CheckBox>`.
 */
function makeTemplateWrapper(story) {
    class StoryTemplate extends Component {
        static template = xml({ raw: [story.template] });
        static components = { [story.component.name]: story.component, ...story.components };
        props = useProps();
    }
    return StoryTemplate;
}

export class ComponentPreview extends Component {
    static template = xml`
        <div t-if="this.props.runtime.story.dialog" class="o_owlybook_dialog_launcher">
            <button class="btn btn-primary" t-on-click="() => this.openDialog()">Open the dialog</button>
            <span class="text-muted small">Changing a prop opens it again with the new value.</span>
            <div t-if="!this.isProbed()" class="d-none">
                <ErrorHandler onError="() => this.onProbeError()">
                    <t t-component="this.Component" t-props="this.props.runtime.getProps()"/>
                </ErrorHandler>
            </div>
        </div>
        <t t-else="" t-component="this.Component" t-props="this.props.runtime.getProps()"/>
    `;

    static components = { ErrorHandler };

    props = useProps({ runtime: t.object() });

    setup() {
        const runtime = this.props.runtime;
        const story = runtime.story;
        this.Component = story.template ? makeTemplateWrapper(story) : story.component;
        useMockServer(runtime);
        if (story.dialog) {
            this.setupDialog();
        }
        const scope = useScope();
        const unsubscribe = onPropsDeclared((declaringScope, schema) => {
            if (declaringScope.componentName !== story.component.name) {
                return;
            }
            // A dialog is rendered by the dialog container, outside the preview.
            if (!story.dialog && !isInside(declaringScope, scope)) {
                return;
            }
            // Not during the render: setting the values renders the story again.
            Promise.resolve().then(() => {
                if (runtime.setSchema(schema)) {
                    runtime.rerender();
                }
            });
        });
        onWillDestroy(unsubscribe);
    }

    /**
     * Dialog stories open their component with the dialog service, as the
     * code using it would, and open it again when a prop changes.
     *
     * Before the first opening, the component is rendered hidden in the page
     * to read its props: opened without the callbacks it requires, it would
     * fail.
     */
    setupDialog() {
        const dialog = useService("dialog");
        this.isProbed = signal(false);
        // The probe fails on the props it lacks. The schema it declared fills
        // them first (a microtask), then the dialog can open.
        this.onProbeError = () => setTimeout(() => this.isProbed.set(true));
        this.openDialog = () => {
            this.closeDialog?.();
            const runtime = this.props.runtime;
            const props = untrack(() => runtime.getProps());
            delete props.close;
            this.closeDialog = dialog.add(this.Component, props, {
                onClose: (params) => runtime.logEvent("close", params === undefined ? [] : [params]),
            });
        };
        useEffect(() => {
            // Reading every value subscribes to them: a change opens it again.
            JSON.stringify(this.props.runtime.values, (key, value) =>
                typeof value === "function" ? undefined : value
            );
            if (this.props.runtime.descriptions() || this.isProbed()) {
                this.isProbed.set(true);
                untrack(() => this.openDialog());
            }
        });
        onWillDestroy(() => this.closeDialog?.());
    }
}

export class ViewPreview extends Component {
    static template = xml`<View t-props="this.getViewProps()"/>`;
    static components = { View };

    props = useProps({ runtime: t.object() });

    setup() {
        useMockServer(this.props.runtime);
        // As an action would: the breadcrumb shows the name of the story.
        const config = getDefaultConfig();
        config.setDisplayName(this.props.runtime.story.title);
        useSubEnv({ config });
    }

    getViewProps() {
        const runtime = this.props.runtime;
        const { models } = runtime.server;
        const relatedModels = Object.fromEntries(
            Object.entries(models).map(([name, model]) => [name, { fields: model.fields }])
        );
        const fields = models[runtime.resModel].fields;
        const display = { ...runtime.story.display };
        if (!runtime.hasControlPanel()) {
            display.controlPanel = false;
        }
        const props = {
            type: runtime.viewType,
            resModel: runtime.resModel,
            // As the server would send it, so onchange methods are called.
            arch: runtime.server.postprocessArch(runtime.arch(), runtime.resModel),
            fields,
            relatedModels,
            searchViewArch: runtime.searchArch(),
            searchViewFields: fields,
            context: runtime.story.context || {},
            domain: runtime.story.domain || [],
            groupBy: runtime.story.groupBy || [],
            display,
            className: "o_owlybook_view",
        };
        if (runtime.viewType === "form" && runtime.resId) {
            props.resId = runtime.resId;
        }
        return props;
    }
}

/**
 * Renders a story and shows the error it raises instead of breaking the page.
 */
export class StoryPreview extends Component {
    static template = "owlybook.StoryPreview";
    static components = { ComponentPreview, ErrorHandler, ViewPreview };

    props = useProps({ runtime: t.object() });

    /**
     * @param {Error} error
     * @param {number} renderKey the render that failed: an older one was
     *   already replaced, its error doesn't matter anymore
     */
    onError(error, renderKey) {
        const runtime = this.props.runtime;
        // The first render of a story can fail on props the story doesn't
        // give: once the props schema is read, it is rendered again with
        // values for them. Wait for that before reporting the error.
        setTimeout(() => {
            if (renderKey === runtime.renderKey()) {
                // A generated story can't guess everything a widget needs: its
                // failure is expected, the panel explains how to fix it.
                if (!runtime.story.generated) {
                    console.error(error);
                }
                runtime.error.set(error);
            }
        });
    }

    getErrorMessage() {
        const error = this.props.runtime.error();
        const cause = error?.cause || error;
        return cause?.message || String(cause);
    }

    getErrorStack() {
        const error = this.props.runtime.error();
        return (error?.cause || error)?.stack || "";
    }
}
