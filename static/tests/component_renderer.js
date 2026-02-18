

import { click, getFixture } from "@web/../tests/helpers/utils";
import { CheckBoxStories } from "./checkbox_tests.stories";
import { cleanStoriesRegistry, setupPlaygroundRegistries, makePlaygroundView } from "./utils";

let target;

QUnit.module("Owlybook", (hooks) => {
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

        await click(target.querySelector(".o_owlybook_item"));
        assert.containsOnce(target, ".o-checkbox");
    });
});
