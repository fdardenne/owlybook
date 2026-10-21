/**
 * Reads the props schema a component gives to `useProps` (built with Owl's `t`
 * helpers) and turns each prop into a description Owlybook can build a
 * control from: its kind, whether it is optional, its default value and, for a
 * selection, its choices.
 *
 * Owl doesn't expose the structure of a type, so it is inferred from what is
 * observable: the name of the validation function, the symbols Owl attaches
 * to it and, as a last resort, the messages of the validation issues.
 */
import { validateType } from "@odoo/owl";

const SAMPLE_VALUES = [
    ["boolean", false],
    ["number", 0],
    ["string", ""],
    ["array", []],
    ["function", () => {}],
    ["object", {}],
];

const KIND_BY_VALIDATOR = {
    validateAny: "any",
    validateArray: "array",
    validateBoolean: "boolean",
    validateConstructor: "component",
    validateFunction: "function",
    validateInstanceType: "instance",
    validateIntersection: "object",
    validateLooseObject: "object",
    validateNumber: "number",
    validatePromise: "promise",
    validateReactiveValue: "signal",
    validateRecord: "object",
    validateStrictObject: "object",
    validateString: "string",
    validateTuple: "array",
};

/** A value no validator accepts, used to collect the issues of a type. */
const NOT_A_VALUE = Object.freeze({ __owlybook__: true });

function getSymbol(type, description) {
    return Object.getOwnPropertySymbols(type).find((symbol) => symbol.description === description);
}

/**
 * Owl reports a wrong literal as "value is not equal to 'draft'": that message
 * is the only place the expected value can be read from.
 *
 * @returns {{ value: any } | null}
 */
function parseLiteralIssue(issue) {
    const match = /^value is not equal to (.*)$/.exec(issue?.message || "");
    if (!match) {
        return null;
    }
    const raw = match[1];
    if (raw.startsWith("'") && raw.endsWith("'")) {
        return { value: raw.slice(1, -1) };
    }
    const constants = { true: true, false: false, null: null, undefined: undefined };
    if (raw in constants) {
        return { value: constants[raw] };
    }
    const number = Number(raw);
    return Number.isNaN(number) ? { value: raw } : { value: number };
}

/**
 * Infers the kinds of values a type accepts by trying a sample of each kind.
 */
function probeKinds(type) {
    return SAMPLE_VALUES.filter(([, value]) => !validateType(value, type).length).map(
        ([kind]) => kind
    );
}

/**
 * @typedef {Object} PropDescription
 * @property {string} kind boolean, number, string, array, object, function,
 *   selection, literal, component, instance, signal, promise or any
 * @property {boolean} optional
 * @property {(() => any) | null} getDefault
 * @property {any[]} [choices] for a selection
 * @property {Record<string, any>} [shape] for an object with known keys
 */

/**
 * @param {Function | null | undefined} type a type built with Owl's `t`
 * @returns {PropDescription}
 */
export function describeType(type) {
    if (typeof type !== "function") {
        // Props declared as a list of names: nothing is known but the name.
        return { kind: "any", optional: false, getDefault: null };
    }
    const optionalSymbol = getSymbol(type, "optional");
    if (optionalSymbol) {
        const defaultSymbol = getSymbol(type, "default");
        const innerType = type[getSymbol(type, "innerType")];
        return {
            ...describeType(innerType),
            optional: true,
            getDefault: defaultSymbol ? type[defaultSymbol] : null,
        };
    }
    const description = { kind: "any", optional: false, getDefault: null };
    const validatorKind = KIND_BY_VALIDATOR[type.name];
    if (validatorKind) {
        description.kind = validatorKind;
        if (validatorKind === "object" && typeof type.toShape === "function") {
            const shape = type.toShape();
            if (shape && !Array.isArray(shape)) {
                description.shape = shape;
            }
        }
        return description;
    }
    const [issue] = validateType(NOT_A_VALUE, type);
    if (type.name === "validateLiteral") {
        const literal = parseLiteralIssue(issue);
        return literal
            ? { ...description, kind: "selection", choices: [literal.value] }
            : description;
    }
    if (type.name === "validateUnion" && issue?.subIssues) {
        const literals = issue.subIssues.map(parseLiteralIssue);
        if (literals.length && literals.every(Boolean)) {
            return { ...description, kind: "selection", choices: literals.map((l) => l.value) };
        }
    }
    // Unions of several kinds and custom validators: use what they accept.
    const kinds = probeKinds(type);
    if (kinds.length === 1) {
        description.kind = kinds[0];
    } else if (kinds.length > 1) {
        description.kinds = kinds;
    }
    return description;
}

/**
 * @param {Record<string, Function> | string[]} schema as given to `useProps`
 * @returns {Record<string, PropDescription>}
 */
export function describeProps(schema) {
    const result = {};
    if (Array.isArray(schema)) {
        for (const name of schema) {
            result[name] = describeType(null);
        }
        return result;
    }
    for (const [name, type] of Object.entries(schema)) {
        result[name] = describeType(type);
    }
    return result;
}

/**
 * Builds a value a component will accept for a prop it requires, so a story
 * renders even when it gives no value for it.
 *
 * @param {PropDescription} description
 * @param {number} [depth]
 */
export function makeSampleValue(description, depth = 0) {
    switch (description.kind) {
        case "boolean":
            return false;
        case "number":
            return 0;
        case "string":
            return "";
        case "array":
            return [];
        case "selection":
            return description.choices[0];
        case "object": {
            const value = {};
            if (description.shape && depth < 3) {
                for (const [key, type] of Object.entries(description.shape)) {
                    const keyDescription = describeType(type);
                    if (!keyDescription.optional) {
                        value[key] = makeSampleValue(keyDescription, depth + 1);
                    }
                }
            }
            return value;
        }
    }
    return undefined;
}
