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
        'web.assets_backend': [
            # scss must be in the backend assets for the tests
            'ui_playground/static/src/js/**/*.scss',
        ],
        'ui_playground.assets_backend': [
            # The UI playground js file has side effects to mount the app to a controller
            # The playground also needs some testing helpers
            ("include", 'web.assets_backend'),
            'ui_playground/static/src/js/**/*.js',
            'ui_playground/static/src/js/**/*.xml',
            'ui_playground/static/src/stories/**/*',

            # next line is required for tour
            'web/static/tests/legacy/legacy_setup.js',

            'web/static/tests/helpers/**/*.js',
            ('remove', "web/static/tests/helpers/legacy.js"),
            ('remove', "web/static/tests/helpers/legacy_env_utils.js"),
            ('remove', "web/static/tests/helpers/mock_env.js"),
        ],
        'web.tests_assets': [
            'ui_playground/static/src/js/**/*.js',
            'ui_playground/static/src/js/**/*.xml',
            ('remove', 'ui_playground/static/src/js/main.js'),
            ('remove', 'ui_playground/static/src/js/mock_qunit.js'),
            'ui_playground/static/tests/**/*',
        ],
    },
    'application': True,
}
