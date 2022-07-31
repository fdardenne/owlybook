from odoo import fields, models

class StorybookStory(models.Model):
    _name = 'storybook.story'

    name = fields.Char('name')
