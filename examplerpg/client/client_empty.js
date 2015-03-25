var http = require("http");

http.createServer(function(request, response) {
	console.log(request.url);
	response.end();
}).listen(12345);