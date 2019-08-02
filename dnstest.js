#!/usr/bin/nodejs
fs = require('fs');

var dns = require('native-dns');

var DNSHandler = function(request, response) {
	var question = request.question[0];
	var hostname = question.name.toLowerCase();
	var length = hostname.length;
	var ttl = Math.floor(Math.random() * 3600);
	//console.log("DNS Lookup", question.type, hostname);

	var IPAddress = request.address.address;
	if (IPAddress.substr(0,7) == '::ffff:')
		IPAddress = IPAddress.substr(7);
	var Host = hostname.split(".");
	if (Host.length >3 && Host[Host.length-3]=='tor' && Host[Host.length-2]=='as206671' && Host[Host.length-1]=='uk')
	{
		if (question.type == 28)
		{
			var Service = Host[Host.length-4];
			response.additional.push(dns.TXT({
				name: request.question[0].name,
				data: ["Query for " + Service + " at " + new Date()],
				ttl: 0,
			}));
			console.log("TOR lookup for " + Service);
			require('dns').lookup("[::1]:9053", function(err, Server, family){
				var req = dns.Request({
					question: dns.Question({name: Service + ".onion", type: "AAAA"}),
					server: { address: "::1", port: 9053, type: 'udp' },
					timeout: 1000,
					rd: true,
				});
				req.on('timeout', function () {
					response.additional.push(dns.TXT({
						name: request.question[0].name,
						data: ["Query TIMEOUT at " + new Date()],
						ttl: 0,
					}));
					response.send();
				});

				req.on('message', function (err, answer) {
					for (var x in answer.answer)
					{
						response.answer.push(dns.AAAA({
							name: request.question[0].name,
							address: answer.answer[x].address,
							ttl: 5,
						}));
					}
				});

				req.on('end', function () {
					response.send();
				});
				req.send();
			});
		}
		else
		{
			response.send();
		}
		return;
	}
	if (Host.length == 5 && Host[2]=='tools' && Host[3]=='as206671' && Host[4]=='uk')
	{
		if (IPAddress.indexOf(':')>-1)
		{
			response.authority.push(dns.NS({
				name: request.question[0].name,
				data: 'ipv4.tools.as206671.uk',
				ttl: 5,
			}));
		}
		else
		{
			response.authority.push(dns.NS({
				name: request.question[0].name,
				data: 'ipv6.tools.as206671.uk',
				ttl: 5,
			}));
		}
		response.additional.push(dns.A({
			name: "ipv4.tools.as206671.uk",
			address: '51.75.162.83',
			ttl: 300,
		}));
		response.additional.push(dns.AAAA({
			name: "ipv6.tools.as206671.uk",
			address: '2001:41d0:801:2000:0:0:0:1ed4',
			ttl: 300,
		}));
		if (Clients[Host[0]] && !Clients[Host[0]].IPs[IPAddress])
		{
			Clients[Host[0]].IPs[IPAddress] = true;
			require("dns").reverse(IPAddress, function(err, Hostnames){
				Clients[Host[0]].ws.send(JSON.stringify({IP:IPAddress, Hostnames:Hostnames}));
				console.log({IP:IPAddress, Hostnames:Hostnames});
			});
		}
	}
	else if (Host.length == 4 && Host[1]=='tools' && Host[2]=='as206671' && Host[3]=='uk')
	{
		if (Host[0]=='whoami')
		{
			if (question.type == 16)
			{
				response.answer.push(dns.TXT({
					name: request.question[0].name,
					data: ["Query from " + IPAddress + " at " + new Date()],
					ttl: 0,
				}));
			}
			else if (IPAddress.indexOf(':')>-1)
			{
				if (question.type == 28 || question.type == 255)
				{
					response.answer.push(dns.TXT({
						name: request.question[0].name,
						data: ["Query from " + IPAddress + " at " + new Date()],
						ttl: 1,
					}));
					response.answer.push(dns.AAAA({
						name: request.question[0].name,
						address: IPAddress,
						ttl: 1,
					}));
				}
				else if (question.type == 1)
				{
					response.authority.push(dns.NS({
						name: request.question[0].name,
						data: 'ipv4.tools.as206671.uk',
						ttl: 1,
					}));
				}
			}
			else
			{
				if (question.type == 1 || question.type == 255)
				{
					response.answer.push(dns.TXT({
						name: request.question[0].name,
						data: ["Query from " + IPAddress + " at " + new Date()],
						ttl: 1,
					}));
					response.answer.push(dns.A({
						name: request.question[0].name,
						address: IPAddress,
						ttl: 1,
					}));
				}
				else if (question.type == 28)
				{
					response.authority.push(dns.NS({
						name: request.question[0].name,
						data: 'ipv6.tools.as206671.uk',
						ttl: 1,
					}));
				}
			}
		}
		else
		{
			response.answer.push(dns.SOA({
				name: "tools.as206671.uk",
				ttl: 300,
				primary: 'tools.as206671.uk',
				admin: 'notmike.notmike.co.uk',
				serial: 1,
				refresh: 600,
				retry: 600,
				expiration: 3600,
				minimum: 5,
			}));
			response.authority.push(dns.NS({
				name: "tools.as206671.uk",
				data: 'ipv4.tools.as206671.uk',
				ttl: 300,
			}));
			response.authority.push(dns.NS({
				name: "tools.as206671.uk",
				data: 'ipv6.tools.as206671.uk',
				ttl: 300,
			}));
		}
	}
	else
	{
		response.answer.push(dns.SOA({
			name: "tools.as206671.uk",
			ttl: 300,
			primary: 'tools.as206671.uk',
			admin: 'notmike.notmike.co.uk',
			serial: 1,
			refresh: 600,
			retry: 600,
			expiration: 3600,
			minimum: 5,
		}));
		response.authority.push(dns.NS({
			name: "tools.as206671.uk",
			data: 'tools.as206671.uk',
			ttl: 300,
		}));
	}
	response.send();
};
var server = dns.createServer({dgram_type: 'udp6'});
server.on('request', DNSHandler).serve(53);
server = dns.createTCPServer({dgram_type: 'tcp6'});
server.on('request', DNSHandler).serve(53);

//dnsd.createServer(DNSHandler).listen(53);
var Clients = {};
var NextID=0;
module.exports = {
	HTTP: function(req, res, startTime, URL, Path, bodyFilename, bodyLength, SendReply) {
		var ID="t"+Math.random().toString().substr(2);
		return SendReply(200, 'text/json', JSON.stringify({ID:ID}));
	},
	WS: function(ws, Path, req) {
		var MyID="t"+Math.random().toString().substr(2);
		Clients[MyID] = {ws:ws, IPs:{}};
		ws.send(JSON.stringify({Resolve:MyID+".dnstest.tools.as206671.uk"}));
		console.log({Resolve:MyID+".dnstest.tools.as206671.uk"});
		ws.onclose = function(){
			console.log("WebSocket Close", MyID);
			delete Clients[MyID];
		};
		setTimeout(function(){
			if (Clients[MyID])
				Clients[MyID].ws.close();
		}, 10000);
	},
};
