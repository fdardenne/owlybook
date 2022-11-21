/** @odoo-module **/

import { mount } from "@odoo/owl";
import { StorybookView } from "./storybook_view";

// The following code ensures that owl mount the component when ready.
// `templates` contains templates contained in the bundles.
//
// In the mount options, it's also possible to add other interresting 
// configuration: https://github.com/odoo/owl/blob/master/doc/reference/app.md#configuration
import { templates } from "@web/core/assets";

owl.whenReady( () => {
    mount(StorybookView, document.body, { templates });
});