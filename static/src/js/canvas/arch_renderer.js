/** @odoo-module */

import { Component, xml, useSubEnv, onError, useState, useRef } from "@odoo/owl";
import { useStories } from "../stories";
import { View } from "@web/views/view";
import { ORM } from "@web/core/orm_service";
import { createDebugContext } from "@web/core/debug/debug_context";

export class ArchRenderer extends Component {
    static template = xml`
        <div t-if="state.hasError" class="alert alert-warning o_error_detail fw-bold m-auto">
            There was a problem when rendering the view. It is probably due to the arch.
        </div>

        <div t-ref="disableAutofocus">
            <View t-if="!state.hasError" t-props="props"/>
        </div>
    `;
    static components = { View };

    setup() {
        this.stories = useStories();
        this.state = useState({ hasError: false });
        this.disableAutofocusElement = useRef("disableAutofocus");

        onError((error) => {
            this.state.hasError = true;
            console.error(error);
        });

        this.props = {
            type: this.stories.active.viewType,
            resModel: this.stories.active.model,
            resId: this.stories.active.resId,
        };
        const serverData = { ...this.stories.active.serverData };
        serverData.views = serverData.views || {};
        this.props.viewId = 100000001;
        serverData.views[`${this.props.resModel},${this.props.viewId},${this.props.type}`] =
            this.stories.activeArch;

        const storyActive = this.stories.active;

        // Build a fake RPC function that handles get_views and other ORM calls
        // using the story's serverData instead of hitting the real server.
        const fakeRPC = async (url, params, options) => {
            const { model, method, args, kwargs } = params || {};

            // Let the story's custom mockRPC handle it first
            if (storyActive.mockRPC) {
                const res = await storyActive.mockRPC(url, params);
                if (res !== undefined) {
                    return res;
                }
            }

            if (method === "get_views") {
                return this._handleGetViews(serverData, model, kwargs);
            }
            if (method === "read") {
                return this._handleRead(serverData, model, args);
            }
            if (method === "web_search_read" || method === "search_read") {
                return this._handleSearchRead(serverData, model, kwargs);
            }
            if (method === "search_count") {
                const records = serverData.models?.[model]?.records || [];
                return records.length;
            }
            if (method === "name_get") {
                const records = serverData.models?.[model]?.records || [];
                const ids = args?.[0] || [];
                return records
                    .filter((r) => ids.includes(r.id))
                    .map((r) => [r.id, r.display_name || r.name || `${model},${r.id}`]);
            }
            if (method === "onchange") {
                return { value: {} };
            }

            console.warn(`[Owlybook] Unhandled RPC: ${model}.${method}`, params);
            return {};
        };

        // Create a custom ORM that uses our fake RPC
        const fakeOrm = new ORM();
        fakeOrm.rpc = fakeRPC;

        // Provide a fake view service that uses the fake ORM
        const fakeViewService = {
            async loadViews(params, options = {}) {
                const { resModel, views, context } = params;
                const result = await fakeOrm.call(resModel, "get_views", [], {
                    context: context || {},
                    views,
                    options,
                });
                const viewDescriptions = {
                    fields: result.models[resModel].fields,
                    relatedModels: result.models,
                    views: {},
                };
                for (const viewType in result.views) {
                    const { arch, id } = result.views[viewType];
                    viewDescriptions.views[viewType] = { arch, id };
                }
                return viewDescriptions;
            },
        };

        useSubEnv({
            services: {
                ...this.env.services,
                rpc: fakeRPC,
                orm: fakeOrm,
                view: fakeViewService,
            },
        });

        useSubEnv(createDebugContext(this.env));
    }

    _handleGetViews(serverData, model, kwargs) {
        const views = kwargs?.views || [];
        const modelData = serverData.models?.[model] || {};
        const fields = modelData.fields || {};
        const result = {
            models: { [model]: { fields } },
            views: {},
        };
        for (const [viewId, viewType] of views) {
            const key = `${model},${viewId},${viewType}`;
            const arch = serverData.views?.[key] || `<${viewType}/>`;
            result.views[viewType] = { arch, id: viewId || false };
        }
        return result;
    }

    _handleRead(serverData, model, args) {
        const records = serverData.models?.[model]?.records || [];
        const ids = args?.[0] || [];
        const fieldNames = args?.[1];
        return records
            .filter((r) => ids.includes(r.id))
            .map((r) => {
                if (fieldNames) {
                    const filtered = { id: r.id };
                    for (const f of fieldNames) {
                        filtered[f] = r[f];
                    }
                    return filtered;
                }
                return { ...r };
            });
    }

    _handleSearchRead(serverData, model, kwargs) {
        const records = serverData.models?.[model]?.records || [];
        const limit = kwargs?.limit || records.length;
        const offset = kwargs?.offset || 0;
        const sliced = records.slice(offset, offset + limit);
        return {
            length: records.length,
            records: sliced,
        };
    }
}
