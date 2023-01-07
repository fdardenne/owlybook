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
        ]
    },
    'application': True,
}
