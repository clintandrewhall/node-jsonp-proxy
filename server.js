// Simple JSONP Proxy for NodeJS
// Josh Hundley - http://joshhundley.com - http://twitter.com/oJshua

var sys = require("sys"), http = require("http"),
    url = require("url"), https = require('https');

var apiPort = parseInt(process.env.PORT) || 8001;

http.createServer(function(req, res) {

  var params = url.parse(req.url, true).query;

  var format = 'json';
  var jsonp = 'jsonp';
  var response = '';
  var requestUrl;
  var protocol;

  function writeUsage(res) {
    res.writeHead(200, {
      'Content-Type' : "text/plain"
    });
    res.write("JSON-P PROXY\n\n");
    res.write("Usage:\n");
    res.write("\turl: The url to access, (required).\n");
    res.write("\tjsonp: The function name to use for the JSON response. Default is 'jsonp'.\n");
    res.write("\tformat: The expected format of the response, if not JSON. Supports: 'text', 'xml', 'string'.\n");
    return res.end();
  }

  function writeJSONP(contents, override) {

    if (typeof override != 'undefined') {
      format = 'json';
    }
    res.writeHead(200, {
      'Content-Type' : 'application/javascript'
    });

    switch (format) {
      case 'text':
      case 'xml':
      case 'string':
        res.write(jsonp + "(unescape('" + escape(contents) + "'))");
        break;
      default:
        res.write(jsonp + '(' + contents + ')');
        break;
    }
    return res.end();
  }

  if (typeof params == 'undefined') {
    return writeUsage(res);
  }

  if (typeof params.format != 'undefined' && params.format != '') {
    format = params.format;
  }

  if (typeof params.jsonp != 'undefined' && params.jsonp != '') {
    jsonp = (params.jsonp + '').replace(/[^a-zA-Z0-9._$]+/g, '');
  }

  if (!params.url) {
    return writeUsage(res);
  }

  var requestURL = url.parse(params.url);
  if (typeof requestURL.host == 'undefined') {
    return writeJSONP(-1, true);
  }


  protocol = http;
  if (requestURL.protocol != 'http:') {
    if (requestURL.protocol === 'https:') {
      protocol = https;
    }
    else {
      return writeJSONP(requestURL.protocol);
    }
  }

  var path = '';

  if (requestURL.pathname) {
    path += requestURL.pathname;
  }

  if (requestURL.search) {
    path += requestURL.search;
  }

  if (path == '') {
    path = '/';
  }

  var port = 80;

  if (requestURL.port) {
    port = requestURL.port;
  }

  var options = {
    path: path,
    method: "GET",
    hostname : requestURL.hostname,
    'Accept' : '*/*',
    'User-Agent' : 'Mozilla/5.0 (compatible; MSIE 6.0; Windows NT5.0)',
    'Accept-Language' : 'en-us',
    'Accept-Charset' : 'ISO-8859-1,utf-8;q=0.7,*;q=0.7'
  };
  request = protocol.request(options);

  request.addListener('response', function(response) {
    var body = '';

    response.setEncoding("utf8");

    response.addListener("data", function(chunk) {
      body += chunk;
    });

    response.addListener('end', function() {
      writeJSONP(body);
    });
  });

  request.end();

}).listen(apiPort);

sys.puts('Server running at http://127.0.0.1:' + apiPort);
