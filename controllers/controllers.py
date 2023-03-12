from odoo import http
from odoo.http import request, route

class OwlybookController(http.Controller):
    @http.route(['/owlybook'], type='http', auth='public')
    def show_owlybook(self):
        """
        Renders the Owlybook
        """
        return request.render('owlybook.owlybook')
