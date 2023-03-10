/** @odoo-module */

import { getStories } from "../../js/stories";

export function getEventFunction(name) {
    return (...args) => onEvent(name, args);
}

export function onEvent(name, args) {
    const params = {};
    for (let i = 0; i < args.length; i++) {
        params[`arg #${i}`] = args[i];
    }
    getStories().active.events.push({ name, params });
}
