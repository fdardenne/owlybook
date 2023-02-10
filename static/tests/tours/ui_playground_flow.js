/** @odoo-module **/

import tour from "web_tour.tour";

tour.register('ui_playground_tour',
    {
        test: true,
    },
    [
        {
            content: "click search",
            trigger: '.o_searchview_input',
            run: 'click',
        },
        {
            content: 'insert text in the searchbar',
            trigger: '.o_searchview_input',
            run: 'text Autocomplete'
        },
    ]
);
