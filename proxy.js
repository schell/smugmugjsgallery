////////////////////////////////////////////////////////////////////////////////
// Copyleft 
//  |      _| |    |   
//    \    _|  _|    \ 
// _| _| _|  \__| _| _| 
// All rights reversed
// Written by Schell Scivally (efnx.com, happyfuntimehacking.com)
// Mon May 31 16:31:56 PDT 2010 
//
// This is a proxy server for ajax calls. (node)
////////////////////////////////////////////////////////////////////////////////
var sys = require('sys'), http = require('http'), url = require('url'), query = require('querystring');

var server = http.createServer(function (userReq, userResp) {
    var uri = url.parse(userReq.url, true);
    var fullProxyURL = uri.href.substring(1, uri.href.length);
    var proxyUri = url.parse(fullProxyURL, true);
    var path = proxyUri.search ? proxyUri.pathname + proxyUri.search : proxyUri.pathname;
    sys.puts('getting ' + proxyUri.hostname + ' ' + path);
    var client = http.createClient(80, proxyUri.hostname);
    var proxyReq = client.request(userReq.method, path, userReq.headers);
    
    proxyReq.addListener('response', function (response) {
        userResp.writeHeader(response.statusCode, response.headers);
        response.addListener('data', function (chunk) {
            userResp.write(chunk, 'binary');
        });
        response.addListener('end', function () {
            userResp.end();
        });
    });
    
    userReq.addListener('data', function (chunk) {
        proxyReq.write(chunk, 'binary');
    });
        
    userReq.addListener('end', function () {
        proxyReq.end();
    });
}).listen(1337);
sys.puts('Server running...');