/** @odoo-module **/

import { UIPlaygroundView } from "../src/js/ui_playground_view";
import { click, getFixture, mount, editInput, nextTick } from "@web/../tests/helpers/utils";
import { registry } from "@web/core/registry";
import { hotkeyService } from "@web/core/hotkeys/hotkey_service";
import { makeTestEnv } from "@web/../tests/helpers/mock_env";
import { CheckBoxStories, storyA, storyB, storyWithoutPropsDef } from "./checkbox_tests.stories";

const storyRegistry = registry.category("stories");
const serviceRegistry = registry.category("services");

function cleanStoriesRegistry() {
    const entries = storyRegistry.getEntries();
    for (const entry of entries) {
        storyRegistry.remove(entry[0]);
    }
}

function setupPlaygroundRegistries() {
    serviceRegistry.add("hotkey", hotkeyService);
}

let target;

QUnit.module("UI Playground", (hooks) => {
    hooks.beforeEach(async () => {
        target = getFixture();
        cleanStoriesRegistry();
        setupPlaygroundRegistries();
    });

    QUnit.module("Sidebar");

    QUnit.test("Sidebar correctly show the stories hierarchy", async (assert) => {
        const env = await makeTestEnv();
        const playgroundEnv = Object.assign(Object.create(env), { config: {} });

        // Add two checkbox stories
        registry.category("stories").add("ui_playground_tests.checkbox", CheckBoxStories);
        await mount(UIPlaygroundView, target, { env: playgroundEnv });

        assert.containsN(target, ".o_ui_playground_module", 1);

        assert.strictEqual(
            target.querySelector(".o_ui_playground_module").textContent,
            "web",
            "web should be the first module"
        );

        // two "folders", one for the introduction and one for checkbox
        assert.containsN(target, ".o_ui_playground_folder", 2);

        assert.strictEqual(
            target.querySelectorAll(".o_ui_playground_folder")[0].textContent,
            "Introduction",
            "Introduction should be the first folder"
        );

        assert.strictEqual(
            target.querySelectorAll(".o_ui_playground_folder")[1].textContent,
            "Checkbox",
            "Checkbox should be the second folder"
        );

        assert.containsN(target, ".o_ui_playground_item", 2);

        assert.strictEqual(
            target.querySelector(".o_ui_playground_item").textContent,
            "CheckboxFirstStory",
            "CheckboxFirstStory should be the first story"
        );

        assert.strictEqual(
            target.querySelectorAll(".o_ui_playground_item:first-child")[1].textContent,
            "CheckboxSecondStory",
            "CheckboxSecondStory should be the second story"
        );
    });

    QUnit.test("Clicking on a folder fold/unfold it", async (assert) => {
        const env = await makeTestEnv();
        const playgroundEnv = Object.assign(Object.create(env), { config: {} });

        registry.category("stories").add("ui_playground_tests.checkbox", CheckBoxStories);
        await mount(UIPlaygroundView, target, { env: playgroundEnv });

        assert.containsN(target, ".o_ui_playground_item", 2);

        // fold
        await click(target.querySelectorAll(".o_ui_playground_folder")[1]);
        assert.containsN(target, ".o_ui_playground_item", 0);

        // unfold
        await click(target.querySelectorAll(".o_ui_playground_folder")[1]);
        assert.containsN(target, ".o_ui_playground_item", 2);
    });

    QUnit.test("Clicking on a module fold/unfold it", async (assert) => {
        const env = await makeTestEnv();
        const playgroundEnv = Object.assign(Object.create(env), { config: {} });

        registry.category("stories").add("ui_playground_tests.checkbox", CheckBoxStories);
        await mount(UIPlaygroundView, target, { env: playgroundEnv });

        assert.containsN(target, ".o_ui_playground_item", 2);
        assert.containsN(target, ".o_ui_playground_folder", 2);

        // fold
        await click(target.querySelector(".o_ui_playground_module"));
        assert.containsN(target, ".o_ui_playground_item", 0);
        assert.containsN(target, ".o_ui_playground_folder", 1);

        // unfold
        await click(target.querySelector(".o_ui_playground_module"));
        assert.containsN(target, ".o_ui_playground_item", 2);
        assert.containsN(target, ".o_ui_playground_folder", 2);
    });

    QUnit.test("Searchbar is filtering stories", async (assert) => {
        const env = await makeTestEnv();
        const playgroundEnv = Object.assign(Object.create(env), { config: {} });

        registry.category("stories").add("ui_playground_tests.checkbox", {
            title: "Checkbox",
            module: "web",
            stories: [storyA],
        });

        registry.category("stories").add("ui_playground_tests.checkbox2", {
            title: "Checkbox2",
            module: "web2",
            stories: [storyB],
        });

        await mount(UIPlaygroundView, target, { env: playgroundEnv });

        assert.containsOnce(target, ".o_searchview_input");
        assert.containsN(target, ".o_ui_playground_item", 2);
        assert.containsN(target, ".o_ui_playground_folder", 3);

        editInput(target, "input.o_searchview_input", "F");
        await nextTick();

        assert.containsOnce(target, ".o_searchview_input");
        assert.containsN(target, ".o_ui_playground_item", 1);
        assert.containsN(target, ".o_ui_playground_folder", 2);

        assert.strictEqual(
            target.querySelector(".o_ui_playground_item").textContent,
            "CheckboxFirstStory",
            "CheckboxFirstStory should be the only one displayed"
        );
        //TODO: Test module number when they are filtered
    });

    QUnit.module("Canvas");

    QUnit.test("Canvas show the clicked story component", async (assert) => {
        const env = await makeTestEnv();
        const playgroundEnv = Object.assign(Object.create(env), { config: {} });

        registry.category("stories").add("ui_playground_tests.checkbox", CheckBoxStories);
        await mount(UIPlaygroundView, target, { env: playgroundEnv });

        await click(target.querySelector(".o_ui_playground_item"));
        assert.containsOnce(target, ".o-checkbox");
    });

    QUnit.module("Props");

    QUnit.test("Props panel shows the props names", async (assert) => {
        const env = await makeTestEnv();
        const playgroundEnv = Object.assign(Object.create(env), { config: {} });

        registry.category("stories").add("ui_playground_tests.checkbox", {
            title: "Checkbox",
            module: "web",
            stories: [storyWithoutPropsDef],
        });
        await mount(UIPlaygroundView, target, { env: playgroundEnv });

        await click(target.querySelector(".o_ui_playground_item"));
        assert.containsOnce(target, ".o-checkbox");

        const namesElement = document.querySelectorAll("tr td:first-child");
        const expectedNames = ["id", "disabled", "value", "slots", "onChange", "className", "name"];

        for (let i = 0; i < expectedNames.length; i++) {
            assert.strictEqual(namesElement[i].textContent, expectedNames[i]);
        }
    });

    QUnit.test("Props panel shows the props types", async (assert) => {
        const env = await makeTestEnv();
        const playgroundEnv = Object.assign(Object.create(env), { config: {} });

        registry.category("stories").add("ui_playground_tests.checkbox", {
            title: "Checkbox",
            module: "web",
            stories: [storyWithoutPropsDef],
        });
        await mount(UIPlaygroundView, target, { env: playgroundEnv });

        await click(target.querySelector(".o_ui_playground_item"));
        assert.containsOnce(target, ".o-checkbox");

        const namesElement = document.querySelectorAll("tr td:nth-child(2)");
        const expectedNames = ["", "Boolean", "Boolean", "Object", "Function", "String", "String"];

        for (let i = 0; i < expectedNames.length; i++) {
            assert.strictEqual(namesElement[i].textContent, expectedNames[i]);
        }
    });

    QUnit.module("Navbar");
});
