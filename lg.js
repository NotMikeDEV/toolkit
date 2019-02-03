#!/usr/bin/nodejs
fs = require('fs');
var Bird = require("./bird");
var spawn = require('child_process').spawn;

module.exports = {
	HTTP: function(req, res, startTime, URL, Path, bodyFilename, bodyLength, SendReply) {
		console.log(req.headers['x-real-ip'], "LG", Path);
		if (Path.length == 2)
		{
			res.writeHead(302, {'Location': '/' +Path[1] + '/'});
			return res.end("Not found");
		}
		if (Path.length == 3 && Path[2] == '')
		{
			return fs.readFile("lg.html", function(err, data){
				if (err)
				{
					res.writeHead(302, {'Location': '/' +Path[1] + '/'});
					return res.end("404 (DNS) Not found");
				}
				console.log("Static Content");
				return SendReply(err?500:200, 'text/html', data);
			});
			return;
		}
		if (Path.length == 4 && Path[2] == 'ping')
		{
			console.log("Ping");
			var ls = spawn('ping', ['-c', '4', Path[3]]);
			res.writeHead(200, {'Content-Type': "text/plain", 'Access-Control-Allow-Origin': '*'});
			ls.stdout.on('data', (data) => {
			  res.write(data);
			});

			ls.stderr.on('data', (data) => {
			  res.write(data);
			});

			ls.on('close', (code) => {
			  res.end();
			});
			return;
		}
		if (Path.length == 4 && Path[2] == 'trace')
		{
			console.log("Ping");
			var ls = spawn('traceroute-nanog', ['-w', '1', Path[3]]);
			res.writeHead(200, {'Content-Type': "text/plain", 'Access-Control-Allow-Origin': '*'});
			ls.stdout.on('data', (data) => {
			  res.write(data);
			});

			ls.stderr.on('data', (data) => {
			  res.write(data);
			});

			ls.on('close', (code) => {
			  res.end();
			});
			return;
		}
		return SendReply(500, 'text/plain', 'Invalid (LG)');
	},
};
