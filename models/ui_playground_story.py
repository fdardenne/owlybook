from odoo import fields, models

class UIPlaygroundStory(models.Model):
    _name = 'ui_playground.story'
    _description = 'Story'

    name = fields.Char('name')
