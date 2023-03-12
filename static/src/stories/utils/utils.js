/** @odoo-module */

import { getStories } from "../../js/stories";

export function getEventFunction(name) {
    const functionName = "trigger event " + name;
    return {
        [functionName](...args) {
            onEvent(name, args);
        },
    }[functionName];
}

export function onEvent(name, args) {
    const params = {};
    for (let i = 0; i < args.length; i++) {
        params[`arg #${i}`] = args[i];
    }
    getStories().active.events.push({ name, params });
}
