/** @odoo-module */

import { getStories } from "../../js/stories"

export function getEventFunction(name) {
  return (...args) => onEvent(name, args);
}

export function onEvent(name, args){
    const argument = []
    for (let i = 0; i < args.length; i++) {
        argument.push("args " + i + ": " + args[i])
    }
    getStories().active.events.push({name, argument});
}

