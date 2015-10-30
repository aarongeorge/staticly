// Dependencies
var utils = require('./utils');

/**
 * extractTemplateFragments
 *
 * @param   {Buffer}    fileContents           A buffer of the files contents
 * @param   {Function}  cb                     Function to be called after function execution
 * @return  {Array}                            Calls {cb} and passes an array of template fragments as the first parameter
 */
var getTemplateFragments = function (fileContents, cb) {
    'use strict';

    // Variables
    var templateFragmentRegex = new RegExp(/<!-- @template (.*?) *-->\s*([\s\S]*?)\s*<!-- \/@template -->/gm);
    var templateFragments = [];
    var match = templateFragmentRegex.exec(fileContents);

    // Loop over all the `templateFragments`
    while (match !== null) {

        // Push `match` to `templateFragments`
        templateFragments.push(match);

        // Query the next `match`
        match = templateFragmentRegex.exec(fileContents);
    }

    // Pass `templateFragments` to `cb`
    cb(templateFragments);
};


/**
 * extractTemplateFragments
 */
var extractTemplateFragments = function (templatePath, cb) {
    'use strict';

    // Read the contents of the template file
    utils.readFile(templatePath, function (templateBuffer) {

        // Get the fragments from the template file
        getTemplateFragments(templateBuffer, function (templateFragments) {

            // Pass the template fragments to the callback
            cb(templateFragments);
        });
    });
};

// Export extractTemplateFragments
module.exports = extractTemplateFragments;
