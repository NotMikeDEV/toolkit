#!/usr/bin/nodejs
fs = require('fs');
microtime = function () {
	var hrtime = require('process').hrtime();
	return hrtime[0] + "." + hrtime[1];
};

RandomString = function(len) {
	var RString = "";
	while (RString.length < len)
		if (Math.random()>=0.8)
			RString += String.fromCharCode((Math.random()*10)+48);
		else if (Math.random()>=0.5)
			RString += String.fromCharCode((Math.random()*26)+65);
		else
			RString += String.fromCharCode((Math.random()*26)+97);
	return RString;
}

var http = require('http');
var https = require('https');
var url = require('url');

var ServerHostname = "tools.as206671.uk";
exec = require('child_process').execSync;
execBG = require('child_process').exec;
require('./dnstest');
// so it can auto-provision a TLS certificate signed by LetsEncrypt.
//exec("certbot certonly --agree-tos --standalone -n -d " + ServerHostname + " -d ipv4." + ServerHostname + " -d ipv6." + ServerHostname + " -m notmike@notmike.co.uk", function(err, stdout, stderr){
//	console.log(err, stdout, stderr);
//});

//Create HTTP server
//var HTTPSOptions = {
//	key: fs.readFileSync('/etc/letsencrypt/live/' + ServerHostname + '/privkey.pem'),
//	cert: fs.readFileSync('/etc/letsencrypt/live/' + ServerHostname + '/fullchain.pem')
//};
var Handler = function (req, res) {
	console.log("Request started");
	var bodyFile = false;
	var bodyFilename = false;
	var bodyLength = 0;
	req.on('data', function (data) {
		if (req.method == 'POST' || req.method == 'PUT')
		{
			if (!bodyFilename)
			{
				bodyFilename="/tmp/" + RandomString(64);
				bodyFile = fs.createWriteStream(bodyFilename, {flags: 'w', encoding: 'binary', autoClose: true});;
			}
			bodyFile.write(data);
			bodyLength += data.length;
			if (bodyLength > 1024*1024*1024)
			{
				res.writeHead(500, {'Error': 'Too much data.'});
				res.end("Too much data.");
				bodyFile.end();
			}
		}
	});
	req.on('error', function (error) {
		console.log("Request Error", error);
	});
	var URL = url.parse(req.url, true);
	var Path = req.url.split("/");
	var Module = Path[1];
	console.log("Request " + Module + " " + req.socket.remoteAddress + " " + req.method + " " + req.url);
	var startTime = Date.now();
	var SendReplyDone=false;
	req.on('end', function () {
		try {
			if (bodyFile)
				bodyFile.end();
			var SendReply= function(Status, Type, Content) {
				if (SendReplyDone) return; else SendReplyDone=true;
				console.log("Response " + Status + ": " + (Date.now() - startTime) + "ms\t" + Type + "\n");
				res.writeHead(Status, {'Content-Type': Type, 'Access-Control-Allow-Origin': '*'});
				res.end(Content);
				return;
			};
			return fs.access("./" + Module + ".js", (function(SendReply){ return function(err){
				if (err)
				{
					if (Module == '')
						Module="index.html";
					return fs.readFile("./" + Module, (function(SendReply){ return function(err, data){
						if (err)
							return SendReply(404, 'text/plain', "404 Not Found");
						else
							return SendReply(200, '', data);
					}})(SendReply));
				}
				
				var Mod = require("./" + Module);
				return Mod.HTTP(req, res, startTime, URL, Path, bodyFilename, bodyLength, SendReply);
			}; })(SendReply));
		} catch (E) {
			if (bodyFilename) fs.unlink(bodyFilename, function(){});
			console.log(E.stack);
			return SendReply(500, 'text/plain', 'Exception occurred');
		}
		if (bodyFilename) fs.unlink(bodyFilename, function(){});
		res.writeHead(500, {'Content-Type': 'text/plain'});
		res.write(JSON.stringify({Error: "Odd thing occurred.\n\n"}));
		console.log("Odd thing occurred.");
		return res.end();
	});
	return;
}
var WebSocket = require('ws');
var server = http.createServer(Handler);
var wss = new WebSocket.Server({ server: server });
wss.on('connection', function connection(ws, req) {
	try{
		var ReqURL = url.parse(req.url, true);
		var Path = ReqURL.pathname.split("/");
		console.log('WebSocket', Path);
		var Module = req.headers['sec-websocket-protocol'];
		return fs.access("./" + Module + ".js", function(err){
			if (err)
			{
				console.error(err);
				return ws.close();
			}
			var Mod = require("./" + Module);
			return Mod.WS(ws, Path, req);
		});
	}catch(E){
		console.error(E);
		try {
			ws.close();
		}catch(E){}
	}
});
server.listen(8080);
process.on('uncaughtException', function (err) {
	console.error(err);
	setTimeout(process.exit, 2000);
});
console.log("Toolserver UP");
