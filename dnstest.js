#!/usr/bin/nodejs
fs = require('fs');

var dig = require('node-dig-dns')

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
	if (Host.length == 3 && Host[0]=='tools' && Host[1]=='as206671' && Host[2]=='uk')
	{
		if (question.type == 1 || question.type == 255)
			response.answer.push(dns.A({
				name: request.question[0].name,
				address: '80.211.145.237',
				ttl: 300,
			}));
		if (question.type == 28 || question.type == 255)
			response.answer.push(dns.AAAA({
				name: request.question[0].name,
				address: '2a00:6d40:72:40ed::1',
				ttl: 300,
			}));
		if (question.type == 2 || question.type == 255)
			response.answer.push(dns.NS({
				name: "tools.as206671.uk",
				data: 'tools.as206671.uk',
				ttl: 300,
			}));
	}
	else if (Host.length == 5 && Host[2]=='tools' && Host[3]=='as206671' && Host[4]=='uk')
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
			address: '80.211.145.237',
			ttl: 300,
		}));
		response.additional.push(dns.AAAA({
			name: "ipv6.tools.as206671.uk",
			address: '2a00:6d40:72:40ed::1',
			ttl: 300,
		}));
		if (Clients[Host[0]] && !Clients[Host[0]].IPs[IPAddress])
		{
			Clients[Host[0]].IPs[IPAddress] = true;
			require("dns").reverse(IPAddress, function(err, Hostnames){
				Clients[Host[0]].ws.send(JSON.stringify({IP:IPAddress, Hostnames:Hostnames}));
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
		else if (Host[0]=='ipv4' && (question.type == 1 || question.type == 255))
		{
			response.answer.push(dns.A({
				name: request.question[0].name,
				address: '80.211.145.237',
				ttl: 300,
			}));
		}
		else if (Host[0]=='ipv6' && (question.type == 28 || question.type == 255))
		{
			response.answer.push(dns.AAAA({
				name: request.question[0].name,
				address: '2a00:6d40:72:40ed::1',
				ttl: 300,
			}));
		}
		else if (Host[0] != 'ipv4' && Host[0] != 'ipv6')
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
var dns = require('native-dns');
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
