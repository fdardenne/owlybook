/** @odoo-module **/

import { click, getFixture } from "@web/../tests/helpers/utils";
import { CheckBoxStories } from "./checkbox_tests.stories";
import { cleanStoriesRegistry, setupPlaygroundRegistries, makePlaygroundView } from "./utils";
import { FormRibbonStories } from "./ribbon_tests.stories";
import { FormIntegerStories } from "./integer_test.stories";

let target;

QUnit.module("Owlybook", (hooks) => {
    hooks.beforeEach(async () => {
        target = getFixture();
        cleanStoriesRegistry();
        setupPlaygroundRegistries();
    });

    QUnit.module("Props");

    QUnit.test("Props panel shows the props names", async (assert) => {
        await makePlaygroundView(target, {
            checkbox: CheckBoxStories,
        });

        await click(target.querySelector(".o_owlybook_item"));
        assert.containsOnce(target, ".o-checkbox");

        const namesElement = document.querySelectorAll("tr td:first-child");
        const expectedNames = ["id", "disabled", "value", "slots", "onChange", "className", "name"];

        for (let i = 0; i < expectedNames.length; i++) {
            assert.strictEqual(namesElement[i].textContent, expectedNames[i]);
        }
    });

    QUnit.test("Props panel shows the props types", async (assert) => {
        await makePlaygroundView(target, {
            checkbox: CheckBoxStories,
        });

        await click(target.querySelector(".o_owlybook_item"));
        assert.containsOnce(target, ".o-checkbox");

        const namesElement = document.querySelectorAll("tr td:nth-child(2)");
        const expectedNames = [
            "Undefined",
            "Boolean",
            "Boolean",
            "Object",
            "Function",
            "String",
            "String",
        ];

        for (let i = 0; i < expectedNames.length; i++) {
            assert.strictEqual(namesElement[i].textContent, expectedNames[i]);
        }
    });

    QUnit.test("Check if Tooltip are present and also the content", async (assert) => {
        await makePlaygroundView(target, {
            checkbox: CheckBoxStories,
        });

        await click(target.querySelector(".o_owlybook_item"));
        assert.containsOnce(target, ".o-checkbox");
        assert.containsN(target, ".owlybook_tooltip", 2);
        const tooltips = document.querySelectorAll(".owlybook_tooltip");
        assert.hasAttrValue(tooltips[0], "tooltip test");
    });

    QUnit.test("Check if changing props has impact on the stories", async (assert) => {
        await makePlaygroundView(target, {
            checkbox: CheckBoxStories,
        });

        await click(target.querySelector(".o_owlybook_item"));
        assert.containsOnce(target, ".o-checkbox");
        assert.ok(target.querySelector(".o-checkbox input").checked);
        await click(target.querySelector("tr:nth-child(3) td:nth-child(3) .o_input"));
        assert.notOk(target.querySelector(".o-checkbox input").checked);
    });

    QUnit.test("Check if choices works has expected", async (assert) => {
        await makePlaygroundView(target, {
            ribbon: FormRibbonStories,
        });

        await click(target.querySelector(".o_owlybook_item"));
        assert.containsOnce(target, ".o-dropdown");
        assert.containsOnce(target, ".bg-success");
        await click(target.querySelector("tr:nth-child(3) td:nth-child(3) .dropdown-toggle"));
        assert.containsOnce(target, ".o-dropdown--menu");
        await click(
            target.querySelector(".o-dropdown--menu .dropdown-item .o_select_menu_item_label")
        );
        assert.containsOnce(target, ".bg-danger");
    });

    QUnit.test("Check if function name works has expected", async (assert) => {
        await makePlaygroundView(target, {
            checkbox: CheckBoxStories,
        });

        await click(target.querySelector(".o_owlybook_item"));
        assert.containsOnce(target, ".o-checkbox");
        const onChange = document.querySelectorAll("tr:nth-child(5) td:nth-child(1)");
        assert.strictEqual(onChange[0].textContent, "onChange");
        const fonctionName = document.querySelectorAll("tr:nth-child(5) td:nth-child(3)");
        assert.strictEqual(fonctionName[0].textContent, "trigger event onChange");
    });

    /**
     * ARCH PART
     */
    QUnit.test("Check if delete props work has expected", async (assert) => {
        await makePlaygroundView(target, {
            ribbon: FormRibbonStories,
        });
        await click(target.querySelector(".o_owlybook_item"));
        const ribbon = document.querySelectorAll(".ribbon");
        assert.strictEqual(ribbon[0].textContent, "ribbon");
        await click(target.querySelector(".o_delete"));
        const newRibbon = document.querySelectorAll(".ribbon");
        assert.strictEqual(newRibbon[0].textContent, "");
    });

    QUnit.debug("Check if suboptions are displayed", async (assert) => {
        await makePlaygroundView(target, {
            number: FormIntegerStories,
        });
        await click(target.querySelector(".o_owlybook_item"));
        const propertyNames = document.querySelectorAll("tr td:first-child");
        console.log(propertyNames);
        const expectedNames = ["placeholder*", "options.type*"];
        for (let i = 0; i < expectedNames.length; i++) {
            assert.strictEqual(propertyNames[i].textContent, expectedNames[i]);
        }
    });
});
