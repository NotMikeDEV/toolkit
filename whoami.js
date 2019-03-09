#!/usr/bin/nodejs
fs = require('fs');

module.exports = {
	HTTP: function(req, res, startTime, URL, Path, bodyFilename, bodyLength, SendReply) {
		if (Path.length == 2)
		{
			res.writeHead(302, {'Location': '/' +Path[1] + '/'});
			return res.end("404 (WhoAmI) Not found");
		}
		try {
			setTimeout(function(){
				return SendReply(500, 'text/plain', "Server Timeout. (WhoAmI API)");
			},5000);
			var IPAddress = req.headers['x-real-ip'];
			if (IPAddress.substr(0,7) == '::ffff:')
				IPAddress = IPAddress.substr(7);
			return execBG('dig -x ' + IPAddress + ' +short|head -n 1', function(err, stdout){
				var Reply = "<p><b>IP Address: "+ IPAddress + "</b>\n";
				if (stdout && stdout != IPAddress)
					Reply += "<br><b>Hostname:</b> " + stdout + "\n";
				if (IPAddress.includes(":"))
					Reply += '<br><a href="http://ipv6.speed.as206671.uk/speed/">[ IPv6 Speed Test ]</a></p>';
				else
					Reply += '<br><a href="http://ipv4.speed.as206671.uk/speed/">[ IPv4 Speed Test ]</a></p>';
				console.log(Reply);
				SendReply(200, 'text/html', Reply);
			});
		} catch (e) {
			console.log(e);
			return SendReply(500, 'text/plain', "500 Invalid something!\n" + e.stack);
		}
		return SendReply(500, 'text/plain', 'Invalid (WhoAmI)');
	},
};
