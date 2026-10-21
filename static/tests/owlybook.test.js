import { describe, expect, test } from "@odoo/hoot";
import { t } from "@odoo/owl";
import { makeTestApp, patchWithCleanup } from "@web/../tests/web_test_helpers";
import { MockServer } from "@owlybook/mock_server/mock_server";
import { normalizeModels } from "@owlybook/mock_server/models";
import {
    getArchNodes,
    scanExtractProps,
    setArchControlValue,
    toPyLiteral,
} from "@owlybook/story/arch_controls";
import { describeProps, makeSampleValue } from "@owlybook/story/props_schema";

describe.current.tags("headless");

describe("props schema", () => {
    test("reads the kind, optionality and default of each prop", () => {
        const descriptions = describeProps({
            label: t.string(),
            count: t.number().optional(3),
            isOpen: t.boolean().optional(),
            onClose: t.function(),
            items: t.array(t.object({ id: t.number() })),
        });
        expect(descriptions.label).toMatchObject({ kind: "string", optional: false });
        expect(descriptions.count).toMatchObject({ kind: "number", optional: true });
        expect(descriptions.count.getDefault()).toBe(3);
        expect(descriptions.isOpen).toMatchObject({ kind: "boolean", optional: true });
        expect(descriptions.onClose.kind).toBe("function");
        expect(descriptions.items.kind).toBe("array");
    });

    test("reads the choices of a selection", () => {
        const { size, mode } = describeProps({
            size: t.selection(["sm", "md", "lg"]),
            mode: t.or([t.literal(1), t.literal(2)]).optional(),
        });
        expect(size).toMatchObject({ kind: "selection", choices: ["sm", "md", "lg"] });
        expect(mode).toMatchObject({ kind: "selection", choices: [1, 2], optional: true });
    });

    test("infers the kinds of a union by trying values", () => {
        const { value } = describeProps({ value: t.or([t.string(), t.number()]) });
        expect(value.kinds).toEqual(["number", "string"]);
    });

    test("props declared as a list of names", () => {
        expect(describeProps(["onError", "slots"]).onError).toMatchObject({ kind: "any" });
    });

    test("sample values for required props follow the shape of objects", () => {
        const { config } = describeProps({
            config: t.object({ name: t.string(), size: t.number(), note: t.string().optional() }),
        });
        expect(makeSampleValue(config)).toEqual({ name: "", size: 0 });
    });
});

describe("arch controls", () => {
    const models = normalizeModels({
        partner: {
            fields: { name: "char", parent_id: { type: "many2one", relation: "partner" } },
            records: [{ id: 1, name: "Agrolait" }],
        },
    });

    test("finds what extractProps reads", () => {
        function extractProps({ attrs, options, placeholder }) {
            const { path, class: classes } = attrs;
            return { a: attrs.autofocus, b: options.no_open, c: options["create_name_field"], path, classes, placeholder };
        }
        const { attrs, options } = scanExtractProps(extractProps);
        expect([...attrs].sort()).toEqual(["autofocus", "class", "path", "placeholder"]);
        expect([...options].sort()).toEqual(["create_name_field", "no_open"]);
    });

    test("lists the options of the widget of a field", async () => {
        await makeTestApp();
        const arch = `<form><field name="parent_id" options="{'no_open': True}"/></form>`;
        const [node] = getArchNodes(arch, models, "partner");
        expect(node.fieldType).toBe("many2one");
        const noOpen = node.controls.find((control) => control.key === "option:no_open");
        expect(noOpen).toMatchObject({ type: "boolean", value: true });
        const widget = node.controls.find((control) => control.key === "attr:widget");
        expect(widget.choices.map((choice) => choice.value)).toInclude("many2one_avatar");
    });

    test("rewrites the node of the arch", async () => {
        await makeTestApp();
        const arch = `<form><field name="parent_id"/><field name="name"/></form>`;
        const [node] = getArchNodes(arch, models, "partner");
        const noOpen = node.controls.find((control) => control.key === "option:no_open");
        const withOption = setArchControlValue(arch, 0, noOpen, true);
        expect(withOption).toBe(
            `<form><field name="parent_id" options="{'no_open': True}"/><field name="name"/></form>`
        );
        expect(setArchControlValue(withOption, 0, noOpen, undefined)).toBe(arch);
        const readonly = node.controls.find((control) => control.key === "attr:readonly");
        expect(setArchControlValue(arch, 1, readonly, true)).toInclude(`<field name="name" readonly="1"/>`);
    });

    test("python literals", () => {
        expect(toPyLiteral({ a: true, b: [1, "x'y"], c: null })).toBe(`{'a': True, 'b': [1, 'x\\'y'], 'c': None}`);
    });
});

describe("mock server", () => {
    function makeServer() {
        return new MockServer({
            partner: {
                fields: {
                    name: "char",
                    parent_id: { type: "many2one", relation: "partner" },
                    tag_ids: { type: "many2many", relation: "tag" },
                },
                records: [
                    { id: 1, name: "Agrolait", tag_ids: [1] },
                    { id: 2, name: "Deco Addict", parent_id: 1 },
                ],
            },
            tag: { records: [{ id: 1, name: "VIP" }] },
        });
    }

    function call(server, model, method, args, kwargs = {}) {
        return server.handleRoute(`/web/dataset/call_kw/${model}/${method}`, { model, method, args, kwargs }).result;
    }

    test("guesses undeclared fields from the records", () => {
        const server = makeServer();
        expect(server.models.tag.fields.name.type).toBe("char");
        expect(server.models.partner.fields.display_name.type).toBe("char");
    });

    test("web_read follows the specification", () => {
        const server = makeServer();
        const [record] = call(server, "partner", "web_read", [[2]], {
            specification: { name: {}, parent_id: { fields: { display_name: {} } }, tag_ids: {} },
        });
        expect(record).toEqual({
            id: 2,
            name: "Deco Addict",
            parent_id: { id: 1, display_name: "Agrolait" },
            tag_ids: [],
        });
    });

    test("web_search_read filters and counts", () => {
        const server = makeServer();
        const result = call(server, "partner", "web_search_read", [], {
            domain: [["name", "ilike", "deco"]],
            specification: { name: {} },
        });
        expect(result).toEqual({ length: 1, records: [{ id: 2, name: "Deco Addict" }] });
    });

    test("web_save creates and writes, with x2many commands", () => {
        const server = makeServer();
        const [created] = call(server, "partner", "web_save", [[], { name: "Gemini", tag_ids: [[4, 1, false]] }], {
            specification: { name: {}, tag_ids: { fields: { name: {} } } },
        });
        expect(created).toEqual({ id: 3, name: "Gemini", tag_ids: [{ id: 1, name: "VIP" }] });
        call(server, "partner", "web_save", [[3], { name: "Gemini Furniture" }], { specification: {} });
        expect(call(server, "partner", "name_search", [], { name: "gemini" })).toEqual([[3, "Gemini Furniture"]]);
    });

    test("web_read_group groups on a many2one", () => {
        const server = makeServer();
        const { groups } = call(server, "partner", "web_read_group", [], {
            domain: [],
            groupby: ["parent_id"],
            aggregates: [],
        });
        expect(groups.map((group) => [group.parent_id, group.__count])).toEqual([
            [false, 1],
            [[1, "Agrolait"], 1],
        ]);
    });

    test("onchange methods run on the changed fields and the arch is marked", () => {
        const server = new MockServer({
            partner: {
                fields: { name: "char", email: "char", parent_id: { type: "many2one", relation: "partner" } },
                records: [{ id: 1, name: "Agrolait", email: "info@agrolait.com" }, { id: 2, name: "Marc" }],
                onchange: {
                    parent_id(record, { getRecord }) {
                        record.email = getRecord("partner", record.parent_id)?.email || false;
                    },
                },
            },
        });
        expect(server.postprocessArch(`<form><field name="parent_id"/><field name="name"/></form>`, "partner")).toBe(
            // name too: display_name depends on it
            `<form><field name="parent_id" on_change="1"/><field name="name" on_change="1"/></form>`
        );
        const result = call(server, "partner", "onchange", [[2], { parent_id: 1 }, ["parent_id"]], {
            fields_spec: { name: {}, email: {}, parent_id: { fields: { display_name: {} } } },
        });
        expect(result).toEqual({ value: { email: "info@agrolait.com" } });
        // nothing is saved until web_save
        expect(server.models.partner.records[1].email).toBe(undefined);
    });

    test("computed fields follow their dependencies, x2many ones included", () => {
        const server = new MockServer({
            order: {
                fields: {
                    line_ids: { type: "one2many", relation: "line" },
                    total: {
                        type: "float",
                        depends: ["line_ids.subtotal"],
                        compute: (order) => order.line_ids.reduce((sum, line) => sum + line.subtotal, 0),
                    },
                },
                records: [{ id: 1, line_ids: [1, 2] }],
            },
            line: {
                fields: {
                    quantity: "integer",
                    price: "float",
                    subtotal: { type: "float", depends: ["quantity", "price"], compute: (l) => l.quantity * l.price },
                },
                records: [{ id: 1, quantity: 2, price: 10 }, { id: 2, quantity: 1, price: 5 }],
            },
        });
        expect(server.models.order.records[0].total).toBe(25);
        // The lines trigger the onchange of the order, and their quantity theirs.
        expect(server.postprocessArch(`<form><field name="line_ids"><list><field name="quantity"/></list></field></form>`, "order")).toBe(
            `<form><field name="line_ids" on_change="1"><list><field name="quantity" on_change="1"/></list></field></form>`
        );
        const onchange = call(server, "order", "onchange", [[1], { line_ids: [[1, 1, { quantity: 5 }]] }, ["line_ids"]], {
            fields_spec: { total: {}, line_ids: { fields: { quantity: {} } } },
        });
        expect(onchange.value.total).toBe(55);
        expect(server.models.order.records[0].total).toBe(25);
        call(server, "order", "web_save", [[1], { line_ids: [[1, 2, { quantity: 3 }]] }], { specification: {} });
        expect(server.models.order.records[0].total).toBe(35);
    });

    test("unknown methods answer false", () => {
        patchWithCleanup(console, { warn: () => expect.step("warning") });
        const server = makeServer();
        expect(call(server, "partner", "action_confirm", [[1]])).toBe(false);
        expect(server.handleRoute("/web/some/route", {})).toBe(null);
        expect.verifySteps(["warning"]);
    });
});
