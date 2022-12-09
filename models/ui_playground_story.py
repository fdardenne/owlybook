from odoo import fields, models

class UIPlaygroundStory(models.Model):
    _name = 'ui_playground.story'

    name = fields.Char('name')
