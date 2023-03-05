/** @odoo-module **/

import { click, getFixture } from "@web/../tests/helpers/utils";
import { CheckBoxStories, CheckBoxStoriesWithoutPropsDef } from "./checkbox_tests.stories";
import { cleanStoriesRegistry, setupPlaygroundRegistries, makePlaygroundView } from "./utils";

let target;

QUnit.module("UI Playground", (hooks) => {
    hooks.beforeEach(async () => {
        target = getFixture();
        cleanStoriesRegistry();
        setupPlaygroundRegistries();
    });

    QUnit.module("Props");

    QUnit.test("Props panel shows the props names", async (assert) => {
        await makePlaygroundView(target, {
            checkbox: CheckBoxStoriesWithoutPropsDef,
        });

        await click(target.querySelector(".o_ui_playground_item"));
        assert.containsOnce(target, ".o-checkbox");

        const namesElement = document.querySelectorAll("tr td:first-child");
        const expectedNames = ["id", "disabled", "value", "slots", "onChange", "className", "name"];

        for (let i = 0; i < expectedNames.length; i++) {
            assert.strictEqual(namesElement[i].textContent, expectedNames[i]);
        }
    });

    QUnit.test("Props panel shows the props types", async (assert) => {
        await makePlaygroundView(target, {
            checkbox: CheckBoxStoriesWithoutPropsDef,
        });

        await click(target.querySelector(".o_ui_playground_item"));
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

        await click(target.querySelectorAll(".o_ui_playground_item")[1]);
        assert.containsN(target, ".ui_playground_tooltip", 3);

        const tooltips = document.querySelectorAll(".ui_playground_tooltip");
        assert.hasAttrValue(
            tooltips[0],
            "data-tooltip",
            "this is a magnificent tooltip",
            "The msg in the tooltip should be 'this is a magnificent tooltip'"
        );
    });
});
