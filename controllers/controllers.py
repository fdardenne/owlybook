from odoo import http
from odoo.http import request, route

class StorybookController(http.Controller):
    @http.route(['/storybook'], type='http', auth='public')
    def show_storybook(self):
        """
        Renders the storybook
        """
        return request.render('odoo-storybook.storybook')



