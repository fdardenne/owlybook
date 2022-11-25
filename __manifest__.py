# -*- coding: utf-8 -*-
{
    'name': "Storybook",

    'summary': """
        Browse and interact with Odoo UI components.""",

    'description': """
        Storybook allows you to explore and interact with Odoo UI components through multiple stories.
    """,

    'author': "Florent Dardenne & Maximilien La Barre",
    'website': "https://github.com/fdardenne/odoo-storybook",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/15.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Productivity/Storybook',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base', 'web'],

    # always loaded
    'data': [
        'views/storybook_views.xml',
        'views/storybook_menus.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'odoo-storybook/static/src/js/**/*',
            'odoo-storybook/static/src/stories/**/*',
        ],
    },
    'application': True,
}
