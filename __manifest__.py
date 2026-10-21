{
    'name': "Owlybook",
    'summary': "Browse, play with and export Odoo UI components in isolation",
    'description': """
Owlybook renders Owl components and view archs in isolation, as stories. Each
story gets live controls built from the component props or from the field
widget options, an events log, the code to reuse it, and can be exported as a
standalone HTML page.
""",
    'author': "Florent Dardenne & Maximilien La Barre",
    'website': "https://github.com/fdardenne/owlybook",
    'category': 'Productivity/Owlybook',
    'version': '2.0.0',
    'depends': ['web'],
    'data': [
        'views/owlybook_templates.xml',
    ],
    'assets': {
        # Everything a story needs to render, shared by the Owlybook UI and by
        # exported stories. Other modules add their stories to
        # `owlybook.stories`, it is included here.
        'owlybook.assets_story': [
            ('include', 'web.assets_backend'),
            # Must run before any component module is loaded, see the file.
            ('after', 'web/static/lib/owl/odoo_module.js', 'owlybook/static/src/props_capture.js'),
            # Lazy loaded in the webclient (graph, pivot, hierarchy... of every
            # installed module), but an exported story can't load anything, so
            # every view type is shipped upfront.
            ('include', 'web.assets_backend_lazy'),
            'web/static/lib/Chart/Chart.js',
            'web/static/lib/chartjs-adapter-luxon/chartjs-adapter-luxon.js',
            'owlybook/static/src/story/**/*',
            'owlybook/static/src/mock_server/**/*',
            'owlybook/static/src/preview/**/*',
            'owlybook/static/src/panel/**/*',
            'owlybook/static/src/stories/**/*',
            ('include', 'owlybook.stories'),
        ],
        'owlybook.assets_owlybook': [
            ('include', 'owlybook.assets_story'),
            'owlybook/static/src/app/**/*',
            'owlybook/static/src/main.js',
        ],
        'owlybook.assets_standalone': [
            ('include', 'owlybook.assets_story'),
            'owlybook/static/src/standalone/**/*',
        ],
        # The whole Owlybook, for a static site: the code editor has to be
        # shipped since nothing can be loaded later.
        'owlybook.assets_site': [
            ('include', 'owlybook.assets_story'),
            ('include', 'web.ace_lib'),
            'owlybook/static/src/app/**/*',
            'owlybook/static/src/site_main.js',
        ],
        'web.assets_unit_tests': [
            'owlybook/static/src/story/**/*',
            'owlybook/static/src/mock_server/**/*',
            'owlybook/static/tests/**/*',
        ],
    },
    'application': True,
    'license': 'LGPL-3',
}
