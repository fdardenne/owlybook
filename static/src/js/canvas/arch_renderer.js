/** @odoo-module */

// @ts-ignore
import { Component, xml, useSubEnv, onError, useState, useRef } from "@odoo/owl";
import { useStories } from "../stories";
import { MockServer } from "@web/../tests/helpers/mock_server";
import { makeFakeRPCService } from "@web/../tests/helpers/mock_services";
import { View } from "@web/views/view";
import { ORM } from "@web/core/orm_service";
import { viewService } from "@web/views/view_service";
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
            // The arch has an error
            this.state.hasError = true;
            console.error(error);
        });

        this.props = { type: this.stories.active.viewType, resModel: this.stories.active.model };
        const serverData = { ...this.stories.active.serverData };
        serverData.views = serverData.views || {};
        this.props.viewId = 100000001;
        serverData.views[`${this.props.resModel},${this.props.viewId},${this.props.type}`] =
            this.stories.activeArch;
        // note: maybe we'll need to use that later
        // props.searchViewId = 100000002; // hopefully will not conflict with an id already in views
        // const searchViewArch = props.searchViewArch || "<search/>";
        // serverData.views[`${props.resModel},${props.searchViewId},search`] = searchViewArch;
        // delete props.searchViewArch;

        const mockServer = new MockServer(this.stories.active.serverData);
        const _mockRPC = async (route, args = {}) => {
            let res;
            if (args.method !== "POST") {
                // simulates that we serialized the call to be passed in a real request
                args = JSON.parse(JSON.stringify(args));
            }
            if (this.stories.active.mockRPC) {
                res = await this.stories.active.mockRPC(
                    route,
                    args,
                    mockServer.performRPC.bind(mockServer)
                );
            }
            if (res === undefined) {
                res = await mockServer.performRPC(route, args);
            }
            return res;
        };

        const rpcService = makeFakeRPCService(_mockRPC).start();

        // setup legacy rpc fake service for the form view basic relational model
        // @ts-ignore
        owl.Component.env.session.rpc = (...args) => {
            let rejection;
            // @ts-ignore
            const prom = new Promise((resolve, reject) => {
                const [route, params, settings = {}] = args;

                // @ts-ignore
                const jsonrpc = rpcService(route, params, {
                    silent: settings.shadow,
                    xhr: settings.xhr,
                });
                rejection = () => {
                    // @ts-ignore
                    jsonrpc.abort();
                };
                jsonrpc.then(resolve);
            });
            // @ts-ignore
            prom.abort = rejection;
            return prom;
        };

        // setup fake rpc and orm services for viewService
        const orm = new ORM(rpcService, this.env.services.user);
        useSubEnv({
            services: {
                ...this.env.services,
                rpc: rpcService,
                orm: orm,
                view: viewService.start(this.env, { orm }),
            },
        });

        useSubEnv(createDebugContext(this.env));
    }
}
