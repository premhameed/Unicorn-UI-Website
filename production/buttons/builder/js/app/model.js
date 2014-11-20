(function(){
    'use strict';

    /*globals Unicorn, Backbone, _ */


    Unicorn.Model = Backbone.Model.extend({

        defaults:  {
            name: 'buttons',
            build_styleguide: false
        },

        initialize: function() {
            this.url = this.get('serverUrl') + '/build/' + this.get('name');
        },

        getFormattedData: function() {
            var raw = this.toJSON();

            //CREATE FORMATTED DATA FOR VIEW TEMPLATES
            return {
                namespace: raw['btn-namespace'],
                color: raw['btn-font-color'],
                size: raw['btn-font-size'],
                weight: raw['btn-font-weight'],
                family: raw['btn-font-family'],
                actions: raw['btn-colors']
            };
        },

        removeDot: function(namespace) {
            return namespace.substr(0, 1) === '.' ? namespace.substr(1, (namespace.length-1)) : namespace;
        },

        build: function(form) {
            var $form = $(form);
            var $colorRows = $form.find('.color-row');

            //Nice UX .. if user doesn't get the default leading dot '.' then
            //we'll strip leading . when they enter (cause we're nice guys)
            var namespace = form['btn-namespace'].value;
            namespace = this.removeDot(namespace);

            //SET NEW BASE VALUES
            var newValues = {
                'btn-namespace': '.' + namespace,//MUST START OUT CONSISTENT WITH CLASS USED IN INITIAL MARKUP!
                'btn-font-size': form['btn-font-size'].value,
                'btn-font-family': form['btn-font-family'].value.split(','),
                'btn-colors': []
            };
            //NOW GET NEW BUTTON ACTION VALUES
            _.each($colorRows, function(row) {
                var $row = $(row);

                newValues['btn-colors'].push({
                    name: $row.find('.action-name').val(),
                    color: $row.find('input[name="color"]').val(),
                    background: $row.find('input[name="background"]').val()
                });
            });

            //SAVE NEW VALUES
            this.save(newValues, {wait: true});
        },

        getPayload: function() {
            var payload =  _.pick(this.attributes, 'btn-namespace', 'btn-font-color', 'btn-font-size', 'btn-font-weight', 'btn-font-family', 'btn-colors', 'btn-shapes', 'btn-sizes', 'types', 'build_styleguide');
            return $.param(payload);
        },

        toJSON: function(method) {
            var data = {};

            if (method === 'update' || method === 'create') {
                //ONLY GRAB THE ATTRIBUTES THE SERVER CAN HANDLE
                data = _.pick(this.attributes, 'btn-namespace',  'btn-font-color', 'btn-font-size', 'btn-font-weight', 'btn-font-family', 'btn-colors', 'btn-shapes', 'btn-sizes', 'build_styleguide');
                data = _.clone(data);
                data.types = this.get('allTypes');
            }
            else {
                data = _.clone(this.attributes);
            }

            return data;
        },

        parse: function(response) {
            var styles = {css: '', options: ''};
            var module = this.get('name');

            //TRIGGER ERROR EVENT AND PASS MESSAGE
            if (response.error) {
                var message = response.message || 'Server error.';
                this.trigger('invalid', message);
            }

            // CHECK FOR PROPER RESPONSE THEN SET CSS
            if (response && response[module]) {
                styles.css = response[module];
            }

            return styles;
        }
    });

})();
