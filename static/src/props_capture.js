/**
 * Owl 3 components declare their props at runtime, by calling `useProps` while
 * they are being built, so a component class doesn't carry its props schema.
 * Owlybook needs that schema to build the controls of a story without asking
 * the story to repeat it.
 *
 * This module wraps `useProps` and reports each schema to the listeners. The
 * bundle loads it right after `@odoo/owl`, before any component module reads
 * `useProps` from it: modules start as soon as their dependencies are there.
 */
import * as owl from "@odoo/owl";

const listeners = new Set();
const originalUseProps = owl.useProps;

function useProps(type) {
    if (type && listeners.size) {
        const scope = owl.useScope();
        for (const listener of listeners) {
            listener(scope, type);
        }
    }
    return originalUseProps(type);
}
useProps.static = originalUseProps.static;

owl.useProps = useProps;
owl.props = useProps;

/**
 * Calls `listener(scope, schema)` each time a component declares its props,
 * before Owl validates them, so the schema is known even if the props given
 * to the component are wrong.
 *
 * @param {(scope: object, schema: object | string[]) => void} listener
 * @returns {() => void} unsubscribes the listener
 */
export function onPropsDeclared(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
