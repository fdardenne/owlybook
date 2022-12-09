from odoo import http
from odoo.http import request, route

class UIPlaygroundController(http.Controller):
    @http.route(['/ui_playground'], type='http', auth='public')
    def show_ui_playground(self):
        """
        Renders the ui playground
        """
        return request.render('ui_playground.ui_playground')
