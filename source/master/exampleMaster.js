var io = require("socket.io")(80);

io.on("connection", function (socket) {
	console.log("Connection");

	socket.on("log", function (data) {
		io.emit("log", data.split(","));
	})
});