{
    'name': "Owlybook",
    'summary': "Browse and interact with Odoo UI components.",
    'description': "Owlybook allows you to explore and interact with Odoo UI components through multiple stories.",
    'author': "Florent Dardenne & Maximilien La Barre",
    'website': "https://github.com/fdardenne/odoo-storybook",
    'category': 'Productivity/Owlybook',
    'version': '0.1',
    'depends': ['base', 'web'],
    'data': [
        'security/ir.model.access.csv',
        'views/owlybook_views.xml',
        'views/owlybook_menus.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'owlybook/static/src/js/**/*.scss',
        ],
        'owlybook.assets_owlybook': [
            ('include', 'web.assets_backend'),
            'owlybook/static/src/js/**/*.js',
            'owlybook/static/src/js/**/*.xml',
            'owlybook/static/src/stories/**/*',
        ],
    },
    'application': True,
}
