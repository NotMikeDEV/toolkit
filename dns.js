#!/usr/bin/nodejs
fs = require('fs');

var dns = require('native-dns');

var SelectRoot = function() {
	var Nodes = [
		"2001:dc3::35",
		"2001:7fd::1",
		"2001:503:c27::2:30",
		"2001:500:2::c",
		"2001:500:2f::f",
		"2001:500:9f::42",
		"2001:500:12::d0d",
		"2001:500:200::b",
		"2001:500:1::53",
		"2001:500:a8::e",
		"2001:503:ba3e::2:30",
		"2001:500:2d::d",
		"2001:7fe::53",
	];
	return Nodes[Math.floor(Math.random()*13)];
};
module.exports = {
	HTTP: function(req, res, startTime, URL, Path, bodyFilename, bodyLength, SendReply) {
		if (Path.length == 2)
		{
			res.writeHead(302, {'Location': '/' +Path[1] + '/'});
			return res.end("404 (DNS) Not found");
		}
		if (Path[2] == 'LOOKUP')
		{
			try {
				return fs.readFile(bodyFilename, function(err,data){
					if (err) throw err;
					var Data = JSON.parse(data);
					console.log(Data);
					var util = require('util');

					var question = dns.Question({
					  name: Data.Hostname,
					  type: Data.Type,
					});

					var start = Date.now();

					require('dns').lookup(Data.Server, function(err, Server, family){
						var req = dns.Request({
						  question: question,
						  server: { address: Server, port: 53, type: 'udp' },
						  timeout: 1000,
						  rd: Data.RD,
						});

						req.on('timeout', function () {
							SendReply(200, 'text/json', JSON.stringify({Error:"Request Timeout"}));
						});

						req.on('message', function (err, answer) {
							console.log(answer);
							answer.header.rcode = dns.consts.RCODE_TO_NAME[answer.header.rcode];
							answer.question[0].type = dns.consts.QTYPE_TO_NAME[answer.question[0].type];
							answer.question[0].class = dns.consts.QCLASS_TO_NAME[answer.question[0].class];
							if (answer.answer.length) {
								answer.answer.forEach(function (R){
									R.type = dns.consts.QTYPE_TO_NAME[R.type];
									R.class = dns.consts.QCLASS_TO_NAME[R.class];
								});
							}

							if (answer.authority.length) {
								answer.authority.forEach(function (R){
									R.type = dns.consts.QTYPE_TO_NAME[R.type];
									R.class = dns.consts.QCLASS_TO_NAME[R.class];
								});
							}
							if (answer.additional.length) {
								answer.additional.forEach(function (R){
									R.type = dns.consts.QTYPE_TO_NAME[R.type];
									R.class = dns.consts.QCLASS_TO_NAME[R.class];
								});
							}
							SendReply(200, 'text/json', JSON.stringify(answer));
						});

						req.on('end', function () {
						  var delta = (Date.now()) - start;
						  console.log('Finished processing request: ' + delta.toString() + 'ms');
						});
						req.send();
					});
				});
			} catch (e) {
				console.log(e);
				return SendReply(500, 'text/plain', "500 Invalid something or other (DNS API)");
			}
		}
		if (Path.length == 3)
		{
			if (Path[2] == '') Path[2]='index.html';
			return fs.readFile("./dns/" + Path[2], function(err, data){
				if (err)
				{
					res.writeHead(302, {'Location': '/' +Path[1] + '/'});
					return res.end("404 (DNS) Not found");
				}
				console.log("Static Content", "./dns/" + Path[2]);
				return SendReply(err?500:200, 'text/html', data);
			});
			return;
		}
		return SendReply(500, 'text/plain', 'Invalid (DNS)');
	},
};
