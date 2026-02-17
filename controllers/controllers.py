from odoo import http
from odoo.http import request


class OwlybookController(http.Controller):
    @http.route(["/owlybook"], type="http", auth="user")
    def show_owlybook(self):
        return request.render(
            "owlybook.owlybook",
            {
                "session_info": request.env["ir.http"].session_info(),
            },
        )
