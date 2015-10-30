// Dependencies
var fs = require('fs');
var http = require('http');

var Utils = {
    'getRequest': function (endpoint, cb) {
        'use strict';

        http.get(endpoint, function (response) {
            var responseBody = '';

            response.on('data', function (d) {
                responseBody += d;
            });

            response.on('end', function () {
                cb(responseBody);
            });
        });
    },

    'readFile': function (file, cb) {
        'use strict';

        // Read the contents of `file`
        fs.readFile(file, function (err, data) {
            if (err) {
                throw err;
            }

            // Pass the contents of `file` to `cb`
            cb(data);
        });
    }
};

module.exports = Utils;
