var io = require("socket.io-client");
var http = require("http");
var url = require("url");

var socket;
var dataQueue = [];
var newDataAllowed = true;

http.createServer(function(request, response) {
	var params = decodeURI(url.parse(request.url).pathname).split("/");
	params.splice(0, 1);
	
	if (params[0] !== "poll") {
		console.log(params);
	}
	
	if (!socket) {
		// We don't have a socket yet we send nothing
		if (params[0] !== "connect") {
			response.end();
			return;
		}

		// Client wants to connect
		socket = io("http://" + params[1]);
		console.log(socket)
	}

	// Scratch wants to send data
	if (params[0] == "emit") {
		socket.emit(params[1], params[2]);
	}

	// Scratch client wants to listen to a new type of event
	if (socket && params[0] == "register") {
		socket.on(params[1], function (event, data) {
			if (typeof data !== "object" && data.length !== "number") {
				throw "You can only send arrays of strings and integers";
			}

			dataQueue.push({
				event: params[1],
				data: data
			});
		}.bind(this, params[1]));
	}

	if (params[0] == "updatevars") {
		newDataAllowed = true;
	}

	if (params[0] == "poll" && newDataAllowed) {
		var data = "";

		for (var k = 1; k < 4; k++) {
			if (dataQueue[0]) {
				data += "event" + k + " " + dataQueue[0].event + "\n";
				data += "value" + k + " " + dataQueue[0].data.join(",") + "\n";
				dataQueue.splice(0, 1);
			}
		}

		response.write(data);
		newDataAllowed = false;
	}

	// We received your request and acknowledge you
	response.end();
}).listen(12345);

