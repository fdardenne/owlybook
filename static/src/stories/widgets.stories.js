import { stories } from "@owlybook/story/story_registry";

// Generated widget stories can be replaced to give them better data.

stories.add({
    widget: "statusbar",
    options: { clickable: true },
});

stories.add({
    widget: "web_ribbon",
    attrs: { title: "Archived", bg_color: "text-bg-danger" },
});

stories.add({
    widget: "many2many_tags",
    options: { color_field: "color" },
});

stories.add({
    widget: "documentation_link",
    attrs: { path: "/applications/general.html", label: "Read the documentation" },
});

stories.add({
    widget: "attach_document",
    attrs: { string: "Attach a document" },
});

stories.add({
    widget: "field_selector",
    options: { model: "res.partner" },
});

// The viewer loads the file from the server in an iframe: start empty.
stories.add({
    widget: "pdf_viewer",
    value: false,
    description: "Shows a PDF file. The viewer loads the file from the server, so the story starts without one.",
});
