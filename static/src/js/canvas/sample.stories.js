/** @odoo-module */

import { CheckBox } from "@web/core/checkbox/checkbox";
const { xml } = owl;

export default {
    title: "Sample Component",
    component: CheckBox,
};

export const VanillaCheckbox = {
    template: xml`<Checkbox/>`,
};
