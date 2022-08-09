/* @odoo-module */

import { registry } from "@web/core/registry";
import { StorybookSidebar } from "./sidebar/storybook_sidebar";

const { Component } = owl;

class StorybookView extends Component {}

StorybookView.template = "storybook.StorybookView";
StorybookView.components = { StorybookSidebar };

registry.category("actions").add("storybook_view", StorybookView);
