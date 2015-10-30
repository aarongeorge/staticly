// Dependencies
var _ = require('lodash');

/**
 * mergeOptions
 *
 * @param  {Object} options            User configuration options for Staticly
 * @param  {Array}  requiredProperties Required configuration options for Staticly
 * @param  {Object} defaultProperties  Default configuration options for Staticly
 * @return {Object}                    Complete options for Staticly
 */
var mergeOptions = function (options, requiredProperties, defaultProperties) {
    'use strict';

    // Make sure `options` contains `template` property
    if (options.templates) {

        // Make sure `options.templates` is not empty
        if (!_.isEmpty(options.templates)) {

            // Iterate over `options.templates` as `templateProperties` and 'templateKey'
            _.forEach(options.templates, function (templateProperties, templateKey) {

                // Iterate over `requiredProperties` as `property`
                _.forEach(requiredProperties, function (property) {

                    // Make sure `templateProperties` contains all properties from `requiredProperties`
                    if (!templateProperties.hasOwnProperty(property)) {

                        // If it doesn't throw an error
                        throw new Error('`' + templateKey + '` does not contain the required property `' + property + '`');
                    }
                });

                // All properties exist so merge `templateProperties` with `defaultProperties`
                _.defaultsDeep(templateProperties, defaultProperties);

            });

            // Return the validated properties
            return options;
        }

        // `options.templates` is empty
        else {
            throw new Error('`options.templates` was empty');
        }
    }

    // `options.templates` was not passed
    else {
        throw new Error('`options.templates` property was not passed');
    }
};

// Export mergeOptions
module.exports = mergeOptions;
