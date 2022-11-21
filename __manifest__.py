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
        'views/templates.xml',
    ],
    'assets': {
        'odoo-storybook.assets_storybook': [
            # bootstrap
            ('include', 'web._assets_helpers'),
            'web/static/src/scss/pre_variables.scss',
            'web/static/lib/bootstrap/scss/_variables.scss',
            ('include', 'web._assets_bootstrap'),
            'web/static/src/libs/fontawesome/css/font-awesome.css',
            'odoo-storybook/static/src/js/**/*.scss',
            'web/static/src/legacy/js/promise_extension.js', # required by boot.js
            'web/static/src/boot.js', # odoo module system
            'web/static/src/env.js', # required for services
            'web/static/src/session.js', # expose __session_info__ containing server information
            'web/static/lib/owl/owl.js', 
            'web/static/lib/owl/odoo_module.js', # to be able to import "@odoo/owl"
            # import only assets and dependencies from core
            'web/static/src/core/utils/functions.js',
            'web/static/src/core/browser/browser.js',
            'web/static/src/core/registry.js',
            'web/static/src/core/assets.js',
            'odoo-storybook/static/src/js/**/*',
        ],
    },
    'application': True,
}
