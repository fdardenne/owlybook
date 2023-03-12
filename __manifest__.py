# -*- coding: utf-8 -*-
{
    'name': "Owlybook",

    'summary': """
        Browse and interact with Odoo UI components.""",

    'description': """
        Owlybook allows you to explore and interact with Odoo UI components through multiple stories.
    """,

    'author': "Florent Dardenne & Maximilien La Barre",
    'website': "https://github.com/fdardenne/odoo-storybook",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/15.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Productivity/Owlybook',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base', 'web'],

    # always loaded
    'data': [
        'views/owlybook_views.xml',
        'views/owlybook_menus.xml',
    ],
    'assets': {
        'web.assets_backend': [
            # scss must be in the backend assets for the tests
            'owlybook/static/src/js/**/*.scss',
        ],
        'owlybook.assets_backend': [
            # The Owlybook js file has side effects to mount the app to a controller
            # The playground also needs some testing helpers
            ("include", 'web.assets_backend'),
            'owlybook/static/src/js/**/*.js',
            'owlybook/static/src/js/**/*.xml',
            'owlybook/static/src/stories/**/*',

            # next line is required for tour
            'web/static/tests/legacy/legacy_setup.js',

            'web/static/tests/helpers/**/*.js',
            ('remove', "web/static/tests/helpers/legacy.js"),
            ('remove', "web/static/tests/helpers/legacy_env_utils.js"),
            ('remove', "web/static/tests/helpers/mock_env.js"),
        ],
        'web.tests_assets': [
            'owlybook/static/src/js/**/*.js',
            'owlybook/static/src/js/**/*.xml',
            ('remove', 'owlybook/static/src/js/main.js'),
            ('remove', 'owlybook/static/src/js/mock_qunit.js'),
            'owlybook/static/tests/**/*',
        ],
    },
    'application': True,
}
