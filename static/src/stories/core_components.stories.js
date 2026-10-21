/**
 * The components of web/core. Props are read from the components: a story only
 * gives what makes the example meaningful.
 */
import { AutoComplete } from "@web/core/autocomplete/autocomplete";
import { CheckBox } from "@web/core/checkbox/checkbox";
import { CodeEditor } from "@web/core/code_editor/code_editor";
import { ColorList } from "@web/core/colorlist/colorlist";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { CopyButton } from "@web/core/copy_button/copy_button";
import { DateTimeInput } from "@web/core/datetime/datetime_input";
import { DateTimePicker } from "@web/core/datetime/datetime_picker";
import { Dialog } from "@web/core/dialog/dialog";
import { DomainSelector } from "@web/core/domain_selector/domain_selector";
import { DomainSelectorDialog } from "@web/core/domain_selector_dialog/domain_selector_dialog";
import { AccordionItem } from "@web/core/dropdown/accordion_item";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";
import { RainbowMan } from "@web/core/effects/rainbow_man";
import { EmojiPicker } from "@web/core/emoji_picker/emoji_picker";
import { ErrorDialog, WarningDialog } from "@web/core/errors/error_dialogs";
import { ExpressionEditor } from "@web/core/expression_editor/expression_editor";
import { FileInput } from "@web/core/file_input/file_input";
import { ModelFieldSelector } from "@web/core/model_field_selector/model_field_selector";
import { ModelSelector } from "@web/core/model_selector/model_selector";
import { Notebook } from "@web/core/notebook/notebook";
import { NotificationAlertDialog } from "@web/core/notification_alert_dialog/notification_alert_dialog";
import { Notification } from "@web/core/notifications/notification";
import { Pager } from "@web/core/pager/pager";
import { MultiRecordSelector } from "@web/core/record_selectors/multi_record_selector";
import { RecordSelector } from "@web/core/record_selectors/record_selector";
import { ResizablePanel } from "@web/core/resizable_panel/resizable_panel";
import { SelectMenu } from "@web/core/select_menu/select_menu";
import { SignatureViewer } from "@web/core/signature/signature_viewer";
import { AvatarTag } from "@web/core/tags_list/avatar_tag";
import { BadgeTag } from "@web/core/tags_list/badge_tag";
import { TagsList } from "@web/core/tags_list/tags_list";
import { TimePicker } from "@web/core/time_picker/time_picker";
import { stories } from "@owlybook/story/story_registry";

// -----------------------------------------------------------------------------
// Inputs
// -----------------------------------------------------------------------------

stories.add({
    component: CheckBox,
    description: "A checkbox, or a switch with the <code>form-switch</code> class.",
    template: `<CheckBox t-props="this.props">Receive the newsletter</CheckBox>`,
    props: { value: true },
    controls: { className: { choices: ["", "form-switch"] } },
    sync: { onChange: "value" },
});

stories.add({
    component: ColorList,
    description: "The color picker of tags and kanban cards. A color is its index in the list.",
    props: { selectedColor: 4 },
    sync: { onColorSelected: "selectedColor" },
});

stories.add({
    component: SelectMenu,
    description: "A select with a search, used by many settings and wizards.",
    props: {
        value: "owl",
        choices: [
            { value: "owl", label: "Owl" },
            { value: "falcon", label: "Falcon" },
            { value: "eagle", label: "Eagle" },
            { value: "sparrow", label: "Sparrow" },
        ],
    },
    sync: { onSelect: "value" },
});

stories.add({
    component: AutoComplete,
    description: "An input suggesting options as you type. Options can be computed from the input.",
    props: {
        value: "",
        placeholder: "Search a bird",
        sources: [
            {
                options: (search) =>
                    ["Owl", "Falcon", "Eagle", "Sparrow", "Hummingbird"]
                        .filter((bird) => bird.toLowerCase().includes(search.toLowerCase()))
                        .map((bird) => ({ label: bird, onSelect: () => {} })),
            },
        ],
    },
});

stories.add({
    component: DateTimeInput,
    description: "An input opening the date picker.",
    props: { type: "datetime" },
});

stories.add({
    component: DateTimePicker,
    description: "The calendar of date fields, here as a range.",
    props: { type: "date", range: true },
});

stories.add({
    component: TimePicker,
    description: "An input for a time of the day, with suggestions every few minutes.",
    props: { value: "09:30" },
    sync: { onChange: "value" },
});

stories.add({
    component: FileInput,
    description: "A button opening the file selector. Uploading needs a server.",
    template: `<FileInput t-props="this.props"><button class="btn btn-secondary">Upload a file</button></FileInput>`,
    props: { acceptedFileExtensions: "image/*" },
});

stories.add({
    component: CopyButton,
    description: "Copies its content to the clipboard.",
    props: { content: "Hello from Owlybook", copyText: "Copy", successText: "Copied!", className: "btn btn-secondary" },
});

stories.add({
    component: CodeEditor,
    description: "The Ace editor used for code, arch and JSON fields.",
    props: { mode: "xml", value: `<form>\n    <field name="name"/>\n</form>`, maxLines: 20 },
    sync: { onChange: "value" },
});

stories.add({
    component: EmojiPicker,
    description: "The emoji picker of chatter and discuss.",
    // Sized like the popover it usually opens in.
    template: `
        <div class="border rounded overflow-auto" style="width: 340px; height: 420px">
            <EmojiPicker t-props="this.props"/>
        </div>`,
});

stories.add({
    component: SignatureViewer,
    description: "Shows a signature, or a placeholder to sign.",
    props: { defaultName: "Mitchell Admin", width: 300, height: 100 },
});

// -----------------------------------------------------------------------------
// Records, models and domains (answered by the in-memory database)
// -----------------------------------------------------------------------------

stories.add({
    component: RecordSelector,
    description: "Picks a record of a model, like a many2one field outside of a view.",
    props: { resModel: "res.partner", resId: 1 },
    sync: { update: "resId" },
});

stories.add({
    component: MultiRecordSelector,
    description: "Picks several records, shown as tags.",
    props: { resModel: "res.partner", resIds: [1, 3] },
    sync: { update: "resIds" },
});

stories.add({
    component: ModelSelector,
    description: "Picks a model among the ones it is given.",
    props: { models: ["res.partner", "story.tag", "story.line"] },
});

stories.add({
    component: ModelFieldSelector,
    description: "Picks a field of a model, following relations.",
    props: { resModel: "res.partner", path: "name", readonly: false },
    sync: { update: "path" },
});

stories.add({
    component: DomainSelector,
    description: "Edits a domain as a tree of conditions.",
    props: { resModel: "res.partner", domain: `[("is_company", "=", True)]`, readonly: false },
    sync: { update: "domain" },
});

stories.add({
    component: ExpressionEditor,
    description: "Edits a Python expression on the fields of a record.",
    props: {
        expression: `is_company and color > 2`,
        fields: {
            is_company: { string: "Is a company", type: "boolean" },
            color: { string: "Color", type: "integer" },
        },
        resModel: "res.partner",
    },
    sync: { update: "expression" },
});

// -----------------------------------------------------------------------------
// Navigation and layout
// -----------------------------------------------------------------------------

stories.add({
    component: Dropdown,
    description: "A toggle opening a menu. <code>DropdownItem</code> closes it when selected.",
    components: { DropdownItem },
    template: `
        <Dropdown t-props="this.props">
            <button class="btn btn-secondary">Actions</button>
            <t t-set-slot="content">
                <DropdownItem onSelected="() => {}">Duplicate</DropdownItem>
                <DropdownItem onSelected="() => {}">Archive</DropdownItem>
                <DropdownItem onSelected="() => {}" class="'text-danger'">Delete</DropdownItem>
            </t>
        </Dropdown>`,
});

stories.add({
    component: AccordionItem,
    description: "A collapsible section, as in the dropdowns of the search panel.",
    template: `
        <div class="dropdown-menu show position-static">
            <AccordionItem t-props="this.props">
                <span class="dropdown-item">Last 7 days</span>
                <span class="dropdown-item">Last 30 days</span>
            </AccordionItem>
        </div>`,
    props: { description: "Date", open: true },
});

stories.add({
    component: Notebook,
    description: "Tabs, each page being a slot.",
    template: `
        <Notebook t-props="this.props">
            <t t-set-slot="general" title="'General'" isVisible="true">
                <p class="p-3">General information.</p>
            </t>
            <t t-set-slot="sales" title="'Sales'" isVisible="true">
                <p class="p-3">Sales information.</p>
            </t>
            <t t-set-slot="notes" title="'Notes'" isVisible="true">
                <p class="p-3">Some notes.</p>
            </t>
        </Notebook>`,
    controls: { orientation: { choices: ["horizontal", "vertical"] } },
});

stories.add({
    component: Pager,
    description: "The pager of the control panel. Click the values to edit them.",
    props: {
        offset: 0,
        limit: 80,
        total: 412,
        // Called by the pager with the new offset and limit: apply them.
        onUpdate({ offset, limit }) {
            this.offset = offset;
            this.limit = limit;
        },
    },
});

stories.add({
    component: ResizablePanel,
    description: "A panel resized with its handle.",
    template: `
        <div class="d-flex border" style="height: 200px">
            <ResizablePanel t-props="this.props">
                <div class="p-3">Drag my edge.</div>
            </ResizablePanel>
            <div class="p-3 flex-grow-1 bg-light">The rest of the page.</div>
        </div>`,
    props: { minWidth: 120, initialWidth: 240 },
});

// -----------------------------------------------------------------------------
// Tags
// -----------------------------------------------------------------------------

stories.add({
    component: BadgeTag,
    description: "A colored tag, as in many2many_tags fields.",
    props: { text: "VIP", color: 5 },
});

stories.add({
    component: AvatarTag,
    description: "A tag with an avatar, as in many2many_tags_avatar fields.",
    props: { text: "Marc Demo", imageUrl: "/web/static/img/user_menu_avatar.png" },
});

stories.add({
    component: TagsList,
    description: "A list of tags, collapsed beyond a limit.",
    components: { BadgeTag },
    template: `
        <div class="d-flex flex-wrap gap-1">
            <TagsList t-props="this.props" t-slot-scope="tag">
                <BadgeTag text="tag.text" color="tag.color"/>
            </TagsList>
        </div>`,
    props: {
        tagLimit: 3,
        tags: [
            { id: 1, text: "Urgent", color: 1 },
            { id: 2, text: "Customer", color: 10 },
            { id: 3, text: "Prospect", color: 3 },
            { id: 4, text: "VIP", color: 5 },
            { id: 5, text: "Partner", color: 7 },
        ],
    },
});

// -----------------------------------------------------------------------------
// Feedback
// -----------------------------------------------------------------------------

stories.add({
    component: Notification,
    description: "A notification, as shown by the notification service.",
    props: {
        title: "Order confirmed",
        message: "The order S00042 was confirmed.",
        type: "success",
        sticky: true,
    },
    controls: { type: { choices: ["info", "success", "warning", "danger"] } },
});

stories.add({
    component: RainbowMan,
    description: "The rainbow man, shown when a task is done well.",
    // It covers the page it is shown on (position: fixed): the transform makes
    // this box the page.
    template: `
        <div class="position-relative overflow-hidden" style="height: 420px; transform: translateZ(0)">
            <RainbowMan t-props="this.props"/>
        </div>`,
    props: {
        message: "Well done! You are a story champion.",
        fadeout: "no",
        imgUrl: "/web/static/img/smile.svg",
    },
    controls: { fadeout: { choices: ["no", "slow", "medium", "fast"] } },
});

// -----------------------------------------------------------------------------
// Dialogs
// -----------------------------------------------------------------------------

stories.add({
    component: Dialog,
    dialog: true,
    description: "The frame of every dialog: a title, a body and a footer.",
    template: `
        <Dialog t-props="this.props">
            <p>The body of the dialog.</p>
            <t t-set-slot="footer">
                <button class="btn btn-primary" t-on-click="this.props.close">Close</button>
            </t>
        </Dialog>`,
    props: { title: "A dialog", size: "md" },
    controls: { size: { choices: ["sm", "md", "lg", "xl", "fs"] } },
});

stories.add({
    component: ConfirmationDialog,
    dialog: true,
    description: "Asks the user to confirm an action.",
    props: {
        title: "Delete the record",
        body: "Are you sure you want to delete this record?",
        confirmLabel: "Delete",
        confirm: () => {},
        cancel: () => {},
    },
});

stories.add({
    component: NotificationAlertDialog,
    dialog: true,
    description: "Explains how to allow the notifications of the browser.",
});

stories.add({
    component: WarningDialog,
    dialog: true,
    description: "Shows a user error, as raised by the server.",
    props: { name: "odoo.exceptions.UserError", message: "You cannot delete a confirmed order." },
});

stories.add({
    component: ErrorDialog,
    dialog: true,
    description: "Shows an unexpected error with its traceback.",
    props: {
        name: "TypeError",
        message: "Cannot read properties of undefined (reading 'id')",
        traceback: "TypeError: Cannot read properties of undefined (reading 'id')\n    at Record.save (web/static/src/model/record.js:42)",
    },
});

stories.add({
    component: DomainSelectorDialog,
    dialog: true,
    description: "Edits a domain in a dialog.",
    props: { resModel: "res.partner", domain: `[("is_company", "=", True)]`, onConfirm: () => {} },
});
