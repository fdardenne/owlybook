# -*- coding: utf-8 -*-
{
    'name': "UI Playground",

    'summary': """
        Browse and interact with Odoo UI components.""",

    'description': """
        UI Playground allows you to explore and interact with Odoo UI components through multiple stories.
    """,

    'author': "Florent Dardenne & Maximilien La Barre",
    'website': "https://github.com/fdardenne/odoo-storybook",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/15.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Productivity/UI Playground',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base', 'web'],

    # always loaded
    'data': [
        'views/ui_playground_views.xml',
        'views/ui_playground_menus.xml',
    ],
    'assets': {
        'ui_playground.assets_ui_playground': [
            'ui_playground/static/src/js/main.js',
        ],
        'web.assets_backend': [
            'ui_playground/static/src/js/**/*',
            ('remove', 'ui_playground/static/src/js/main.js'),
            'ui_playground/static/src/stories/**/*',
        ],
        'web.tests_assets': [
            'ui_playground/static/tests/**/*',
        ],
         'ui_playground.tests_assets_copy': [
            # If we have time, assets must be refactored to only include what we need maybe
            # This is a copy of tests_assets without the tests added by other module
            'web/static/lib/qunit/qunit-2.9.1.css',
            'web/static/lib/qunit/qunit-2.9.1.js',
            'web/static/tests/legacy/helpers/**/*',
            ('remove', 'web/static/tests/legacy/helpers/test_utils_tests.js'),
            'web/static/tests/legacy/legacy_setup.js',

            # 'web/static/lib/fullcalendar/core/main.css',
            # 'web/static/lib/fullcalendar/daygrid/main.css',
            # 'web/static/lib/fullcalendar/timegrid/main.css',
            # 'web/static/lib/fullcalendar/list/main.css',
            # 'web/static/lib/fullcalendar/core/main.js',
            # 'web/static/lib/fullcalendar/moment/main.js',
            # 'web/static/lib/fullcalendar/interaction/main.js',
            # 'web/static/lib/fullcalendar/daygrid/main.js',
            # 'web/static/lib/fullcalendar/timegrid/main.js',
            # 'web/static/lib/fullcalendar/list/main.js',
            # 'web/static/lib/fullcalendar/luxon/main.js',

            # 'web/static/lib/ace/ace.js',
            # 'web/static/lib/ace/javascript_highlight_rules.js',
            # 'web/static/lib/ace/mode-python.js',
            # 'web/static/lib/ace/mode-xml.js',
            # 'web/static/lib/ace/mode-js.js',
            # 'web/static/lib/ace/mode-qweb.js',
            # 'web/static/lib/nearest/jquery.nearest.js',
            # 'web/static/lib/daterangepicker/daterangepicker.js',
            # 'web/static/src/legacy/js/libs/daterangepicker.js',
            # 'web/static/lib/stacktracejs/stacktrace.js',
            # 'web/static/lib/Chart/Chart.js',

            # '/web/static/lib/daterangepicker/daterangepicker.js',

            # 'web/static/tests/legacy/main_tests.js',
            'web/static/tests/helpers/**/*.js',
            # 'web/static/tests/views/helpers.js',
            # 'web/static/tests/search/helpers.js',
            # 'web/static/tests/views/calendar/helpers.js',
            # 'web/static/tests/webclient/**/helpers.js',
            # 'web/static/tests/qunit.js',
            # 'web/static/tests/main.js',
            # 'web/static/tests/mock_server_tests.js',
            # 'web/static/tests/setup.js',

            # # These 2 lines below are taken from web.assets_frontend
            # # They're required for the web.frontend_legacy to work properly
            # # It is expected to add other lines coming from the web.assets_frontend
            # # if we need to add more and more legacy stuff that would require other scss or js.
            # ('include', 'web._assets_helpers'),
            # 'web/static/src/scss/pre_variables.scss',
            # 'web/static/lib/bootstrap/scss/_variables.scss',

            # ('include', 'web.frontend_legacy'),
            # ("include", "web.assets_backend_legacy_lazy"),
        ],
    },
    'application': True,
}
