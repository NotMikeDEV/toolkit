const promisify = require('promisify-node');
const fs = promisify('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { Script } = require("vm");
const jquery = require("jquery");
const dns = require('native-dns');
dns.CONST = require('native-dns-packet').consts;
const DNS = require('../../server/DNS');
const IPAddr = require('ip6addr');

function DNSQuery(Request) {
	if (Request.Command == 'Resolve') {
		console.log({Hostname: Request.Hostname});
        return DNS.DNSLookup(Request.Hostname);
	}
	if (Request.Command == 'Query') {
		var ReturnResult = false;
		const Records = new Promise( (resolutionFunc) => {
			ReturnResult = resolutionFunc;
		});
		console.log({name: Request.Name, type: Request.Type, server:Request.Server});
		var req = dns.Request({
			question: dns.Question({name: Request.Name, type: Request.Type}),
			server: { address: Request.Server, type: 'udp' },
			timeout: 5000,
			rd: false,
			try_edns: true,
		});
		const RequestTime = new Date();
		req.on('message', (err, answer) => {
			answer.header.rcode = dns.CONST.RCODE_TO_NAME[answer.header.rcode];
			answer.info = {
				time: Math.floor(new Date() - RequestTime),
				size: answer._socket.size,
				when: RequestTime.toString(),
				server: answer._socket.address + '#' + answer._socket.port
			};
			delete answer._socket;
			delete answer.__proto__;
			ReturnResult(answer);
		});
		req.on('timeout', () => {ReturnResult();});
		req.send();
		return Records;
	}
}

module.exports = async (Service)=>{
	var HTML = await Service.StaticPage(null, 'modules/dns/index.html');
	
	class CustomResourceLoader extends jsdom.ResourceLoader {
		fetch(url, options) {
			if (url.indexOf('jquery.min.js') > 0) {
				return Promise.resolve(fs.readFile('node_modules/jquery/dist/jquery.min.js'));
			}
			return null;
		}
	}
	Service.ExpressRouter.get('/dns/', (req, res)=>{
		res.set('Content-Type', 'text/html');
		if (req.query.hostname !== undefined &&
				req.query.type !== undefined &&
				req.query.server !== undefined) {
			const DOM = new JSDOM(HTML, {
				runScripts: 'dangerously',
				resources: new CustomResourceLoader()
			});
			const { window } = DOM;
			window.onload=async()=>{
				window.eval("window.$ = $;");
				const $ = window.$;
				const Cache = {};
				window.Server.Execute = (Request) => {
					const RequestString = JSON.stringify(Request);
					if (Cache[RequestString]!==undefined) {
						return Cache[RequestString];
					}
					Cache[RequestString] = DNSQuery(Request);
					return Cache[RequestString];
				};
				window.eval("console.log=()=>{}");
				window.HideResults = ()=>{};
				window.DoLookup(req.query.hostname, req.query.type, req.query.server)
				.then(()=>{
					console.log("Done Rendering");
					res.send(DOM.serialize());
				}).catch(()=>{
					res.send(DOM.serialize());
				});
			};
		} else {
			res.send(HTML);
		}
	});
	Service.IO.of('/dns/').on('connect', (socket) => {
		socket.on('message', async(Request, Response) => {
			DNSQuery(Request).then(Response).catch((e)=>{
				socket.emit('error', e);
				socket.close();
			});
		});
	});
};