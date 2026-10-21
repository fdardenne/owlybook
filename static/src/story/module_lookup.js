/**
 * Finds where a value (usually a component class) is exported from, by
 * looking through the modules the Odoo module loader has started. That gives
 * a story its addon and its import statement for free.
 */

let exportsIndex = null;
let indexedModuleCount = 0;

function buildIndex() {
    const index = new Map();
    for (const [moduleName, moduleExports] of odoo.loader.modules) {
        if (!moduleName.startsWith("@") || !moduleExports || typeof moduleExports !== "object") {
            continue;
        }
        for (const [exportName, value] of Object.entries(moduleExports)) {
            const isIndexable = typeof value === "function" || (value && typeof value === "object");
            if (isIndexable && !index.has(value)) {
                index.set(value, { moduleName, exportName });
            }
        }
    }
    return index;
}

/**
 * @param {Function | Object} value a component, a registry entry...
 * @returns {{ moduleName: string, exportName: string, addon: string, path: string[] } | null}
 *   e.g. moduleName "@web/core/checkbox/checkbox", addon "web",
 *   path ["core", "checkbox", "checkbox"]
 */
export function findExport(value) {
    // Rebuilt when modules were loaded since the last lookup.
    if (!exportsIndex || odoo.loader.modules.size !== indexedModuleCount) {
        exportsIndex = buildIndex();
        indexedModuleCount = odoo.loader.modules.size;
    }
    const found = exportsIndex.get(value);
    if (!found) {
        return null;
    }
    const [addon, ...path] = found.moduleName.slice(1).split("/");
    return { ...found, addon, path };
}
