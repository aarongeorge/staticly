// Dependencies
var _ = require('lodash');
var path = require('path');
var utils = require('./utils');
var handlebars = require('handlebars');

var getFragmentAttributes = function (fragmentAttributesString) {
    'use strict';

    var attribsRegex = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;
    var match = attribsRegex.exec(fragmentAttributesString);
    var attributes = {};

    while (match !== null) {
        attributes[match[1]] = match[2];
        match = attribsRegex.exec(fragmentAttributesString);
    }

    return attributes;
};

var getFragmentType = function (fragmentAttributes) {
    'use strict';

    if (_.has(fragmentAttributes, 'url')) {
        return 'url';
    }

    else if (_.has(fragmentAttributes, 'file')) {
        return 'file';
    }

    else if (_.has(fragmentAttributes, 'inline')) {
        return 'inline';
    }

    else {
        return 'default';
    }
};

var getFragmentData = function (fragmentType, fragmentAttributes, templateDir, cb) {
    'use strict';

    switch (fragmentType) {
        case 'url': {
            utils.getRequest(fragmentAttributes.url, function (data) {
                cb(data);
            });

            break;
        }

        case 'file': {
            utils.readFile(path.resolve(templateDir, fragmentAttributes.file), function (data) {
                cb(data);
            });

            break;
        }

        case 'inline': {
            cb(fragmentAttributes.inline);

            break;
        }
    }
};

var transformData = function (data, transform) {
    'use strict';

    return transform(data);
};

var compileTemplateWithData = function (templateFragment, templateData, cb) {
    'use strict';

    // Create the handlebars template for `templateFragment`
    var template = handlebars.compile(templateFragment[2]);

    // Pass the compile `templateFragment` to `cb`
    cb(template(templateData));
};

var compileTemplateFragment = function (templateOptions, templateFragment, entry, cb) {
    'use strict';

    var fragmentAttributes = getFragmentAttributes(templateFragment[1]);
    var fragmentType = getFragmentType(fragmentAttributes);
    var templateDir = path.dirname(templateOptions.templatePath);

    // `fragmentType` is not `default`
    if (fragmentType !== 'default') {

        // Get the data
        getFragmentData(fragmentType, fragmentAttributes, templateDir, function (data) {

            // Apply default transform
            data = templateOptions.transforms[fragmentType](data);

            // `fragmentAttributes.transform` exists
            if (_.has(fragmentAttributes, 'transform')) {

                // Apply custom transform
                data = transformData(data, templateOptions.transforms[fragmentAttributes.transform]);
            }

            // Compile the template
            compileTemplateWithData(templateFragment, data, function (compiledFragment) {

                // Pass `compiledFragment` to `cb`
                cb(compiledFragment);
            });
        });
    }

    // `fragmentType` is `default`
    else {

        var data = entry;

        // `fragmentAttributes.transform` exists
        if (_.has(fragmentAttributes, 'transform')) {

            // Apply custom transform
            data = transformData(data, templateOptions.transforms[fragmentAttributes.transform]);
        }

        // Compile the template
        compileTemplateWithData(templateFragment, data, function (compiledFragment) {

            // Pass `compiledFragment` to `cb`
            cb(compiledFragment);
        });
    }
};

module.exports = compileTemplateFragment;
