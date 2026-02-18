from odoo import fields, models


class OwlybookStory(models.Model):
    _name = 'owlybook.story'
    _description = 'Owlybook Story'

    name = fields.Char('name')
