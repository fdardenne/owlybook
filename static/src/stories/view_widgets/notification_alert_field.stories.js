/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {},
    },
    views: {},
};

const formWithNotificationAlert = {
    title: "Notification Alert",
    model: "partner",
    viewType: "form",
    arch: `<form>
    <sheet>
        <widget name="notification_alert"/>
    </sheet>
</form>`,
    serverData,
};

export const FormNotificationAlertStories = {
    title: "Widget",
    module: "web",
    stories: [formWithNotificationAlert],
};

registry.category("stories").add("ui_playground.formWithNotificationAlert", FormNotificationAlertStories);
