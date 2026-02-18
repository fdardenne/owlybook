import { mount, nextTick, click, patchWithCleanup, makeDeferred } from "@web/../tests/helpers/utils";
import { setupViewRegistries } from "@web/../tests/views/helpers";
import { registry } from "@web/core/registry";
import { makeTestEnv } from "@web/../tests/helpers/mock_env";
import { OwlybookView } from "../src/js/owlybook_view";
import { CodeEditor } from "../src/js/components/code_editor/code_editor";

export function cleanStoriesRegistry() {
    const entries = registry.category("stories").getEntries();
    for (const entry of entries) {
        registry.category("stories").remove(entry[0]);
    }
}

export function setupPlaygroundRegistries() {
    setupViewRegistries();
}

export async function makePlaygroundView(target, stories) {
    const env = await makeTestEnv();
    // @ts-ignore
    env.session = {};
    for (const name in stories) {
        registry.category("stories").add(name, stories[name]);
    }
    await mount(OwlybookView, target, { env });
    await nextTick();
}

export async function selectStory(target, name) {
    const story = Array.from(target.querySelectorAll(".o_owlybook_item")).find(
        (el) => el.textContent === name
    );
    await click(story);
    await nextTick();
}

export async function patchCodeEditor() {
    const defer = makeDeferred();
    patchWithCleanup(CodeEditor.prototype, {
        async loadEditor() {
            await this._super();
            // @ts-ignore
            defer.resolve();
        },
        async loadLibs() {},
        async setType() {},
    });
    return defer;
}
