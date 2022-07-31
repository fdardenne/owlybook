/* @odoo-module */

import { registry } from "@web/core/registry";

const { Component } = owl;

class StorybookView extends Component {}

StorybookView.template = "storybook.StorybookView";

registry.category("actions").add("storybook_view", StorybookView);
