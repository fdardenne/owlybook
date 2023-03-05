/** @odoo-module **/

import {
    getFixture,
    nextTick,
} from "@web/../tests/helpers/utils";
import { FormStories } from "./form_tests.stories";
import {
    cleanStoriesRegistry,
    setupPlaygroundRegistries,
    makePlaygroundView,
    selectStory,
    patchCodeEditor
} from "./utils";

let target;
let deferEditor;

QUnit.module("UI Playground", (hooks) => {
    hooks.beforeEach(async () => {
        target = getFixture();
        cleanStoriesRegistry();
        setupPlaygroundRegistries();
        deferEditor = patchCodeEditor();
    });

    QUnit.module("Arch Renderer");

    QUnit.test("Form view is rendered", async (assert) => {
        await makePlaygroundView(target, {
            form: FormStories,
        });
        await selectStory(target, "Form example");
        await nextTick();
        assert.containsOnce(target, ".o_form_view", "The form view should be rendered");
    });

    QUnit.test("The arch showed in the code tabs is correct", async (assert) => {
        await makePlaygroundView(target, {
            form: FormStories,
        });
        await selectStory(target, "Form example");
        await Promise.resolve(deferEditor);
        await nextTick();
        assert.containsOnce(target, "#ace-editor", "The code editor should be present");
        // await triggerEvents(target, "#ace-editor textarea", ["focus", "click"]);

        assert.strictEqual(
            target.querySelector("#ace-editor .ace_content").textContent,
            `<form><sheet><group><field name="description"/><field name="image_url"/></group></sheet></form>`,
            "the arch in the code tab should be correct"
        );
    });
});
