from odoo import fields, models

class OwlybookStory(models.Model):
    _name = 'owlybook.story'

    name = fields.Char('name')
