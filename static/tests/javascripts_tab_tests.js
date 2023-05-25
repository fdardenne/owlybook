/** @odoo-module **/

import { getFixture, nextTick, click } from "@web/../tests/helpers/utils";

import { CheckBoxStories } from "./checkbox_tests.stories";
import {
    cleanStoriesRegistry,
    setupPlaygroundRegistries,
    makePlaygroundView,
    patchCodeEditor,
    selectStory,
} from "./utils";

let target;
let deferEditor; // So we can execute tests when CodeEditor is ready

QUnit.module("Owlybook", (hooks) => {
    hooks.beforeEach(async () => {
        target = getFixture();
        cleanStoriesRegistry();
        setupPlaygroundRegistries();
        deferEditor = patchCodeEditor();
    });

    QUnit.module("Javascript Tab");

    QUnit.test("Check if javascript tab works properly", async (assert) => {
        await makePlaygroundView(target, {
            checkbox: CheckBoxStories,
        });
        await selectStory(target, "Checkbox");
        await nextTick();
        const currentTab = target.querySelector(".nav .nav-link.active").innerText;
        assert.strictEqual(currentTab, "Props", "Bottom panel tabs should be on 'Props'");
        //change to javascripts tabs
        await click(target.querySelector(".o_owlybook_panel .nav-item:nth-child(3) a"));
        await nextTick();
        await Promise.resolve(deferEditor);
        //wait for the code to be ready and query each line
        const code = target.querySelectorAll(".ace_line");
        let res = "";
        code.forEach((element) => (res += element.textContent));
        assert.strictEqual(
            res,
            'class CheckBoxParentTest extends Component {    static template = "owlybook.CheckBoxStoriesTest";    static components = { CheckBox };}'
        );
    });
});
