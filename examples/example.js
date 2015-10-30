var staticly = require('../index');

staticly({
    'templates': {
        'articles': {
            'endpoint': 'http://jsonplaceholder.typicode.com/users',            // Required
            // 'filetype': '.customOneFiletype',                  // Optional, defaults to .html
            'outputDir': './compiled/articles/',              // Optional, defaults to cwd/
            'templatePath': './templates/article-template.hbs',    // Required
            'transforms': {
                // 'endpoint': 'customOne endpoint transform',    // Optional, defaults to JSONparse
                // 'url': 'customOne url transform',              // Optional, defaults to JSONparse
                // 'inline': 'customOne inline transform',        // Optional, defaults to JSONparse
                // 'file': 'customOne file transform',            // Optional, defaults to JSONparse
                'anyOther': function (data) {
                    'use strict';

                    data = {
                        'title': 'Replaced with any other'
                    };

                    return data;
                } // Optional
            }
        }
    }
});
