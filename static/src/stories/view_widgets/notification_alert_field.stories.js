/** @odoo-module */

import { registry } from "@web/core/registry";

const serverData = {
    models: {
        partner: {
            records: [
                {
                    id: 1,
                },
            ],
        },
    },
    views: {},
};

const formWithNotificationAlert = {
    title: "Notification Alert",
    model: "partner",
    viewType: "form",
    resId: 1,
    arch: `<form>
    <sheet>
        <widget name="notification_alert"/>
        <div>
            If you see nothing it can be normal. This widget will display a message if your
            browser blocked the notifications from Odoo.
        </div>
    </sheet>
</form>`,
    serverData,
};

export const FormNotificationAlertStories = {
    title: "Widget",
    module: "web",
    stories: [formWithNotificationAlert],
};

registry
    .category("stories")
    .add("owlybook.formWithNotificationAlert", FormNotificationAlertStories);
