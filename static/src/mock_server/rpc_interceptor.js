/**
 * Routes the calls the web client makes to the mock server of the story being
 * rendered. Every rpc goes through `rpc._rpc`, which the web client keeps
 * overridable for that purpose.
 */
import { rpc } from "@web/core/network/rpc";

let activeServer = null;
let activeOwner = null;
let isOffline = false;
const originalRpc = rpc._rpc;

/**
 * Sends the calls to `server` until `releaseMockServer` is called with the
 * same owner. When a story is replaced, the next story sets its server before
 * the previous one is destroyed: the owner keeps the previous one from
 * releasing the server of the next one.
 *
 * @param {import("./mock_server").MockServer | null} server null to send the
 *   calls to the Odoo server
 * @param {Object} owner
 */
export function setMockServer(server, owner) {
    activeServer = server;
    activeOwner = owner;
}

/**
 * @returns {import("./mock_server").MockServer | null}
 */
export function getMockServer() {
    return activeServer;
}

/**
 * @param {Object} owner
 */
export function releaseMockServer(owner) {
    if (activeOwner === owner) {
        activeServer = null;
        activeOwner = null;
    }
}

function withAbort(promise) {
    promise.abort = () => {};
    return promise;
}

/**
 * @param {Object} [options]
 * @param {boolean} [options.offline] no server behind: unhandled calls are
 *   answered with `false` instead of being sent
 */
export function installRpcInterceptor({ offline = false } = {}) {
    isOffline = offline;
    rpc._rpc = function (url, params, settings) {
        if (activeServer) {
            let response;
            try {
                response = activeServer.handleRoute(url, params);
            } catch (error) {
                console.error(`[Owlybook] Mock server error on ${url}`, error);
                return withAbort(Promise.reject(error));
            }
            if (response) {
                // Copy like a network round trip would, so the client never
                // shares objects with the fake database.
                const result = JSON.parse(JSON.stringify(response.result ?? false));
                return withAbort(Promise.resolve(result));
            }
        }
        if (isOffline) {
            // An empty object: what most routes return, and what their callers
            // handle best (`"key" in result`, `result.key`...).
            return withAbort(Promise.resolve({}));
        }
        return originalRpc.call(this, url, params, settings);
    };
}
