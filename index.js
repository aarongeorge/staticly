// Dependencies
var async = require('async');
var compileTemplateFragment = require('./lib/compileTemplateFragment');
var extractTemplateFragments = require('./lib/extractTemplateFragments');
var fs = require('fs');
var mergeOptions = require('./lib/mergeOptions');
var utils = require('./lib/utils');

/**
 * Staticly
 *
 * @param {Object} options User configuration options for Staticly
 */
var Staticly = function (options) {
    'use strict';

    // If this is being called for the first time, make it an instance
    if (!(this instanceof Staticly)) {
        return new Staticly(options);
    }

    // Required template type properties
    this.requiredTemplateTypeProperties = ['endpoint', 'templatePath'];

    // Default template type properties
    this.defaultTemplateTypeProperties = {
        'filetype': '.html',
        'outputDir': process.cwd(),
        'transforms': {
            'endpoint': function (data) {

                // If endpoint
                if (typeof (data) === 'object') {
                    return data;
                }

                else {
                    return JSON.parse(data);
                }
            },

            'url': function (data) {
                return JSON.parse(data);
            },

            'inline': function (data) {
                return JSON.parse(String(data)
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                );
            },

            'file': function (data) {
                return JSON.parse(data);
            }
        }
    };

    // Merge `defaultTemplateTypeProperties` with `options`
    this.options = mergeOptions(options, this.requiredTemplateTypeProperties, this.defaultTemplateTypeProperties);

    // Run init
    this.init();
};

// Init method
Staticly.prototype.init = function () {
    'use strict';

    // Iterate over `this.options.templates`
    async.forEachOf(this.options.templates, function (templateOptions, key, nextTemplate) {

        // Get all entries for template
        utils.getRequest(templateOptions.endpoint, function (entries) {

            // Perform `templateOptions.transforms.endpoint` on `entries`
            entries = templateOptions.transforms.endpoint(entries);

            // Iterate over `entries`
            async.each(entries, function (entry, nextEntry) {

                // Start fragment control flow
                async.waterfall([

                    // Extract all fragments
                    function (nextFragmentStep) {

                        // Extract `fragments` and pass them to `nextFragmentStep`
                        extractTemplateFragments(templateOptions.templatePath, function (fragments) {

                            // Pass `fragments` to nextFragmentStep
                            nextFragmentStep(null, fragments);
                        });
                    },

                    // Compile `templateFragments`
                    function (templateFragments, nextFragmentStep) {

                        // Array to store compiled fragments
                        var compiledFragments = [];

                        // Iterate over `templateFragments`
                        async.each(templateFragments, function (templateFragment, nextTemplateFragment) {

                            // Compile `templateFragment` and apply transform if necessary
                            compileTemplateFragment(templateOptions, templateFragment, entry, function (compiledFragment) {

                                // Push compiled `compiledFragment` to `compiledFragments`
                                compiledFragments[templateFragments.indexOf(templateFragment)] = compiledFragment;

                                // Move onto next fragment
                                nextTemplateFragment();
                            });
                        },

                        // Finished iterating over `templateFragments`
                        function (err) {
                            if (err) {
                                throw err;
                            }

                            // Pass `compiledFragments` to `nextFragmentStep`
                            nextFragmentStep(null, templateFragments, compiledFragments);
                        });
                    },

                    // Write new file
                    function (templateFragments, compiledFragments, nextFragmentStep) {

                        // Read the template file into memory
                        utils.readFile(templateOptions.templatePath, function (templateBuffer) {

                            // Convert `templateBuffer` to string
                            templateBuffer = templateBuffer.toString();

                            // Iterate over `compiledFragments`
                            for (var i = 0; i < compiledFragments.length; i++) {

                                // Replace all `templateFragments` with `compiledTemplates` in `templateBuffer`
                                templateBuffer = templateBuffer.replace(templateFragments[i][0], compiledFragments[i]);
                            }

                            // Convert `templateBuffer` to buffer
                            templateBuffer = new Buffer(templateBuffer, 'utf8');

                            // Write the new page for the template entry
                            fs.writeFile(templateOptions.outputDir + templateOptions.fileName + templateOptions.filetype, templateBuffer, function (err) {
                                if (err) {
                                    throw err;
                                }

                                // Add function to write file to disk
                                nextFragmentStep();
                            });
                        });
                    }
                ],

                // Finished fragment control flow
                function (err) {
                    if (err) {
                        throw err;
                    }

                    nextEntry();
                });
            },

            // Finished iterating over `entries`
            function (err) {
                if (err) {
                    throw err;
                }

                nextTemplate();
            });
        });
    },

    // Finished iterating over `this.options.templates`
    function (err) {

        if (err) {
            throw err;
        }

        console.log('All done bro');
    });
};

// Export
module.exports = Staticly;
