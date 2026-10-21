/**
 * Writes the code to reuse a component story as it is currently configured:
 * the import and the template calling the component with its props.
 */
import { globalTemplates } from "@odoo/owl";
import { getTemplate } from "@web/core/templates";
import { serializeXML } from "@web/core/utils/xml";

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/**
 * Formats a value as a JavaScript literal fitting in a double quoted XML
 * attribute (strings use single quotes).
 */
export function toJsLiteral(value, depth = 0) {
    if (value === undefined) {
        return "undefined";
    }
    if (value === null || typeof value === "boolean" || typeof value === "number") {
        return String(value);
    }
    if (typeof value === "string") {
        return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n")}'`;
    }
    if (depth > 4) {
        return "...";
    }
    if (Array.isArray(value)) {
        return `[${value.map((item) => toJsLiteral(item, depth + 1)).join(", ")}]`;
    }
    if (typeof value === "object") {
        const entries = Object.entries(value).map(([key, item]) => {
            const formattedKey = IDENTIFIER.test(key) ? key : toJsLiteral(key);
            return `${formattedKey}: ${toJsLiteral(item, depth + 1)}`;
        });
        return entries.length ? `{ ${entries.join(", ")} }` : "{}";
    }
    return "undefined";
}

function escapeAttribute(text) {
    return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * @param {Record<string, any>} props
 * @returns {string[]} one `name="expression"` per prop
 */
function formatAttributes(props) {
    return Object.entries(props).map(([name, value]) => {
        const expression = typeof value === "function" ? `this.${name}` : toJsLiteral(value);
        return `${name}="${escapeAttribute(expression)}"`;
    });
}

function formatElement(tagName, props) {
    const attributes = formatAttributes(props);
    if (!attributes.length) {
        return `<${tagName}/>`;
    }
    const oneLine = `<${tagName} ${attributes.join(" ")}/>`;
    if (oneLine.length <= 100) {
        return oneLine;
    }
    return `<${tagName}\n${attributes.map((a) => `    ${a}`).join("\n")}\n/>`;
}

/**
 * @param {import("../story/story_runtime").ComponentStoryRuntime} runtime
 * @returns {{ usage: string, template: string, source: string }}
 */
export function getComponentCode(runtime) {
    const { story } = runtime;
    const props = runtime.getProps();
    const lines = [];
    if (story.importPath) {
        lines.push(`import { ${story.exportName} } from "${story.importPath}";`, "");
    }
    lines.push("<!-- in the template of your component -->");
    if (story.template) {
        const element = formatElement(story.component.name, props);
        lines.push(
            story.template
                .trim()
                .replace(new RegExp(`<${story.component.name}\\s+t-props="this.props"\\s*/>`), element)
                .replace(
                    new RegExp(`<${story.component.name}\\s+t-props="this.props"\\s*>`),
                    element.replace(/\/>$/, ">")
                )
        );
    } else {
        lines.push(formatElement(story.component.name, props));
    }
    const callbacks = Object.keys(props).filter((name) => typeof props[name] === "function");
    if (callbacks.length) {
        lines.push("", "// in your component class", ...callbacks.map((name) => `${name}(...args) {}`));
    }
    let template = "";
    const templateName = story.component.template;
    if (typeof templateName === "string" && templateName in globalTemplates) {
        // Inline template, written with xml``
        template = String(globalTemplates[templateName]).trim();
    } else if (typeof templateName === "string") {
        const element = getTemplate(templateName);
        template = element ? serializeXML(element) : "";
    }
    return {
        usage: lines.join("\n"),
        template,
        source: story.component.toString(),
    };
}
