/** @odoo-module **/

import { Component, useEffect } from "@odoo/owl";
import { ComponentRenderer } from "./component_renderer";
import { ArchRenderer } from "./arch_renderer";
import { useStories } from "../stories";

export class Canvas extends Component {
    static components = { ComponentRenderer, ArchRenderer };
    static template = "ui_playground.canvas";

    setup() {
        this.stories = useStories();

        // We don't want the user to be interrupted by Autofocus made by Views or Component when the
        // user edit props or the arch. This is the only way I found to avoid the focus as the
        // useAutofocus function is not patchable.
        // TODO: find a better solution ...
        useEffect(
            (canvasElement) => {
                const realFocusFunction = HTMLElement.prototype.focus;
                HTMLElement.prototype.focus = function (params) {
                    // Enable focus only when the bottom panel is not edited and the focus come from
                    // the canvas
                    if (
                        !document.querySelector(".o_canvas_sheet").contains(this) ||
                        !document
                            .querySelector(".o_ui_playground_panel")
                            .contains(document.activeElement)
                    ) {
                        return realFocusFunction.bind(this)(params);
                    }
                };
                return () => {
                    HTMLElement.prototype.focus = realFocusFunction;
                };
            },
            () => []
        );
    }
}
