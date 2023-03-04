/** odoo-module */

// We do not want to include QUnit in the bundle but mock_services and
// other dependencies from the arch_renderer indirectly needs it. So let's "mock" it.
const QUnit = {
    on: () => {},
    module: (name, options, executeNow) => {
        // mock_server file is enclosed in a QUnit.module
        options();
    },
    testStart: () => {},
};
// @ts-ignore
document.QUnit = QUnit;
