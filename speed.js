#!/usr/bin/nodejs
fs = require('fs');
crypto = require('crypto');

module.exports = {
	HTTP: function(req, res, startTime, URL, Path, bodyFilename, bodyLength, SendReply) {
		if (Path.length == 2)
		{
			res.writeHead(302, {'Location': '/' +Path[1] + '/'});
			return res.end("404 (Speed) Not found");
		}
		if (Path.length == 3 && Path[2] == '')
		{
			return fs.readFile("speed.html", function(err, data){
				if (err)
				{
					res.writeHead(302, {'Location': '/' +Path[1] + '/'});
					return res.end("404 (Speed) Not found");
				}
				console.log("Static Content");
				return SendReply(err?500:200, 'text/html', data);
			});
			return;
		}
		if (Path.length == 4 && Path[2] == 'down')
		{
			try{
				var Size = parseInt(Path[3]);
				crypto.randomBytes(10240, (err, buff) => {
					console.log("SpeedTest", "Download " + Size);
					res.writeHead(200, {});
					for (var x=0; x<Size/10240; x++)
						res.write(buff);
					return res.end();
				});
				return;
			}catch(e){
				return SendReply(err?500:200, 'text/plain', "Error");
			}
		}
		if (Path.length == 3 && Path[2] == 'up' && (req.method == 'POST' || req.method == 'PUT'))
		{
			try{
				fs.stat(bodyFilename, function(err,stats){
					var Size = stats.size;
					console.log("SpeedTest", "Upload " + Size);
					return SendReply(200, 'text/plain', ""+Size);
				});
				return;
			}catch(e){
				return SendReply(200, 'text/plain', "0");
			}
		}
		return SendReply(500, 'text/plain', 'Invalid (Speed)');
	},
	WS: function(ws, Path, req) {
		ws.send('Ready\n');
		ws.onclose = function(){
			console.log("WebSocket Close");
		};
		ws.onmessage = function(evt){
			console.log("SpeedTest RECV", evt.data);
			var Data = evt.data;
			var Type = Data.substr(0, Data.indexOf("\n"));
			if (Type == "Download")
			{
				Size = parseInt(Data.substr(Data.indexOf("\n")+1, Data.length));
				crypto.randomBytes(102400-5, (err, buff) => {
					console.log("SpeedTest", "Sending " + buff.length);
					ws.send("TimerReset\n\n");
					for (var i=0; i<Size/102400; i++)
						ws.send("Data\n" + buff);
					ws.send("Download\n");
				});
			}
		};
	},
};
