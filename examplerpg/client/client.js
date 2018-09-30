var io = require("socket.io-client");
var http = require("http");
var url = require("url");

var socket;
var dataQueue = [];
var newDataAllowed = true;

http.createServer(function(request, response) {
	response.writeHead(200, {"Content-Type": "text/plain"});
	var params = decodeURI(url.parse(request.url).pathname).split("/");
	params.splice(0, 1);
	
	for (var k = 0; k < params.length; k++) {
		params[k] = decodeURIComponent(params[k]);
	}
	
	//if (params[0] !== "poll") {
	//	console.log(params);
	//}
	
	// Client wants to connect
	if (!socket && params[0] == "connect") {
		console.log("Connecting to ", params[1])
		socket = io(params[1]);
	}

	// Scratch wants to send data
	if (params[0] == "emit" && socket) {
		socket.emit(params[1], params[2]);
	}

	// Scratch client wants to listen to a new type of event
	if (socket && params[0] == "register") {
		socket.on(params[1], function (event, data) {			
			console.log(data)

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
		var firstCreatePlayer = true;

		for (var k = 1; k < 4; k++) {
			if (dataQueue[0] && (dataQueue[0] !== "createplayer" || firstCreatePlayer)) {
				if (dataQueue[0] == "createplayer") {
					firstCreatePlayer = false;
				}
				
				data += "event" + k + " " + dataQueue[0].event + "\n";
				data += "value" + k + " " + dataQueue[0].data + "\n";
				dataQueue.splice(0, 1);
			} else {
				data += "event" + k + " none\n";
				data += "value" + k + " none\n";
			}
		}
		
		response.write(data);
		newDataAllowed = false;
	}

	// We received your request and acknowledge you
	response.end();
}).listen(12345);

