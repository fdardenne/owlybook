/** @odoo-module **/

import { CheckBoxStories } from "./checkbox_tests.stories";
import { cleanStoriesRegistry, setupPlaygroundRegistries, makePlaygroundView } from "./utils";
import { FormIntegerStories } from "./integer_test.stories";
import { click, getFixture, nextTick, patchWithCleanup } from "@web/../tests/helpers/utils";
import { onWillStart } from "@odoo/owl";
import { makeFakeRouterService } from "@web/../tests/helpers/mock_services";
import { registry } from "@web/core/registry";
import { OwlybookView } from "../src/js/owlybook_view";

let target;
let setupRouter = (router) => {};
let router;

QUnit.module("Owlybook", (hooks) => {
    hooks.beforeEach(async () => {
        target = getFixture();
        cleanStoriesRegistry();
        setupPlaygroundRegistries();
        const routerService = makeFakeRouterService();
        patchWithCleanup(OwlybookView.prototype, {
            setup() {
                this._super();
                router = this.router;
                onWillStart(async () => {
                    await setupRouter(router);
                });
            },
        });
        const serviceRegistry = registry.category("services");
        serviceRegistry.add("router", routerService, { force: true });
    });

    QUnit.module("Url");

    QUnit.test("Check if the link changes correctly", async (assert) => {
        setupRouter = async (router) => {
            router.pushState({
                module: "web",
                folder: "Core components",
                title: "CheckboxFirstStory",
            });
            await nextTick();
        };
        await makePlaygroundView(target, {
            checkbox: CheckBoxStories,
            number: FormIntegerStories,
        });
        assert.containsOnce(target, ".o-checkbox");
    });

    QUnit.test("Check when clicking on a stories that the hash change", async (assert) => {
        await makePlaygroundView(target, {
            checkbox: CheckBoxStories,
            number: FormIntegerStories,
        });
        await click(target.querySelector(".o_owlybook_item"));
        assert.containsOnce(target, ".o-checkbox");
        assert.deepEqual(router.current.hash, {
            module: "web",
            folder: "Core components",
            title: "CheckboxFirstStory",
        });
    });
});
