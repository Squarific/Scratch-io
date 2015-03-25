var io = require("socket.io")(4567);

io.on("connection", function (socket) {
	socket.broadcast.emit("createplayer", socket.id);

	socket.on("log", function (data) {
		io.emit("log", data.split(","));
	});
	
	socket.on("playermove", function (data) {
		var data = data.split(",");
		socket.broadcast.emit("playermove", [socket.id, data[0], data[1]]);
	});
});