JSON-P Proxy in Node.js
===

To run:

    node server.js

The server will start on port 8001 unless process.env.PORT is specified.

Parameters:

    url: The url to access, (required).
    jsonp: The function name to use for the JSON response. Default is 'jsonp'.");
    format: The expected format of the response, if not JSON. Supports: 'text', 'xml', 'string'.