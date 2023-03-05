/** @odoo-module **/

import { click, getFixture } from "@web/../tests/helpers/utils";
import { CheckBoxStories } from "./checkbox_tests.stories";
import { cleanStoriesRegistry, setupPlaygroundRegistries, makePlaygroundView } from "./utils";

let target;

QUnit.module("UI Playground", (hooks) => {
    hooks.beforeEach(async () => {
        target = getFixture();
        cleanStoriesRegistry();
        setupPlaygroundRegistries();
    });

    QUnit.module("Component Renderer");

    QUnit.test("Canvas show the clicked story component", async (assert) => {
        await makePlaygroundView(target, {
            checkbox: CheckBoxStories,
        });

        await click(target.querySelector(".o_ui_playground_item"));
        assert.containsOnce(target, ".o-checkbox");
    });
});
