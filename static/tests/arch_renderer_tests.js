

import {
    editSelectMenu,
    getFixture,
    nextTick,
    click,
    patchWithCleanup,
} from "@web/../tests/helpers/utils";
import { CodeEditor } from "../src/js/components/code_editor/code_editor";
import { FormStories } from "./form_tests.stories";
import {
    cleanStoriesRegistry,
    setupPlaygroundRegistries,
    makePlaygroundView,
    selectStory,
    patchCodeEditor,
} from "./utils";

let target;
let deferEditor; // So we can execute tests when CodeEditor is ready
let onChangeCallback; // callback to change the CodeEditor

QUnit.module("Owlybook", (hooks) => {
    hooks.beforeEach(async () => {
        target = getFixture();
        cleanStoriesRegistry();
        setupPlaygroundRegistries();
        deferEditor = patchCodeEditor();
        onChangeCallback = (value) => {};
        patchWithCleanup(CodeEditor.prototype, {
            setup() {
                this._super();
                // So we can manually trigger the onChange
                onChangeCallback = this.props.onChange;
            },
        });
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

        assert.strictEqual(
            target.querySelector("#ace-editor .ace_content").textContent,
            `<form><sheet><group><field name="description"/><field name="image_url"/></group></sheet></form>`,
            "the arch in the code tab should be correct"
        );
    });

    QUnit.test("Modifying the arch does change the view", async (assert) => {
        await makePlaygroundView(target, {
            form: FormStories,
        });
        await selectStory(target, "Form example");
        await Promise.resolve(deferEditor);
        await nextTick();
        assert.containsOnce(target, "#ace-editor", "The code editor should be present");
        assert.containsOnce(
            target,
            ".o_form_label[for=image_url_0]",
            "Should have an input for the image label"
        );
        assert.containsNone(
            target,
            ".o_owlybook_panel button",
            "the render button should be present"
        );
        // change the codeEditor value
        onChangeCallback('<form><sheet><group><field name="description"/></group></sheet></form>');
        await nextTick();
        assert.containsOnce(
            target,
            ".o_owlybook_panel button",
            "the render button should be present"
        );
        await click(target.querySelector(".o_owlybook_panel button"));

        assert.containsNone(
            target,
            ".o_form_label[for=image_url]",
            "Should not have an input for the image label"
        );
    });

    QUnit.test("Modifying arch's attributes with the props tab", async (assert) => {
        await makePlaygroundView(target, {
            form: FormStories,
        });
        await selectStory(target, "Form example attrs");
        await nextTick();
        const currentTab = target.querySelector(".nav .nav-link.active").innerText;
        assert.strictEqual(currentTab, "Props", "Bottom panel tabs should be on 'Props'");
        assert.containsN(
            target,
            ".o_owlybook_bottom_bar tbody tr:first-child td",
            3,
            "Should have 3 props"
        );
        // Go to code tab
        await click(target.querySelector(".o_owlybook_panel .nav-item:nth-child(2) a"));
        await nextTick();
        await Promise.resolve(deferEditor);
        let code = target.querySelector(".ace_line").textContent;
        assert.strictEqual(
            code,
            '<form><sheet><group><field name="description" string="Paper" password="true"  /></group></sheet></form>'
        );

        // Go to props tab
        await click(target.querySelector(".o_owlybook_panel .nav-item:nth-child(1) a"));

        assert.strictEqual(
            target.querySelector(".o_field_widget input").type,
            "password",
            "the input type should be password in the form view"
        );

        // Deactivate the password attribute
        await click(
            target.querySelector(
                ".o_owlybook_bottom_bar tbody tr:nth-child(2) td:nth-child(3) input"
            )
        );

        assert.strictEqual(
            target.querySelector(".o_field_widget input").type,
            "text",
            "the input type should be text in the form view"
        );

        // Change the string choice
        await editSelectMenu(target, ".o_owlybook_panel .o_select_menu", "Rock");
        assert.strictEqual(
            target.querySelector(".o_form_sheet .o_form_label").textContent,
            "Rock",
            "The string label should be 'Rock'"
        );

        // Change an option attribute
        await click(
            target.querySelector(
                ".o_owlybook_bottom_bar tbody tr:nth-child(3) td:nth-child(3) input"
            )
        );

        // Go to code tab
        await click(target.querySelector(".o_owlybook_panel .nav-item:nth-child(2) a"));
        await nextTick();
        code = target.querySelector(".ace_line").textContent;
        assert.strictEqual(
            code,
            '<form><sheet><group><field name="description" string="Rock" password="false" options="{\'dynamic_placeholder\':true}" /></group></sheet></form>'
        );
    });
});
