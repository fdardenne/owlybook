from odoo.tests import HttpCase
from odoo.tests.common import tagged

@tagged('post_install', '-at_install')
class TestUiPlaygroundTour(HttpCase):
    def test_ui_playground_tour(self):
        # You can also use watch=True to see the browser in action
        self.start_tour('/ui_playground', 'ui_playground_tour', watch=True)
