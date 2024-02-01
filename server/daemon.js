const promisify = require('promisify-node');
const fs = promisify('fs');
const spawn = promisify('child_process').spawn;

env = {}
env["CADDYPATH"]="/data/caddy"
env["HOME"]="/data/caddy"
env["PATH"]="/bin:/usr/bin"

const caddy = spawn("caddy", ["start", "--config", "/etc/caddy/Caddyfile"], {env:env})
caddy.stdout.on('data', (data)=>{console.log("caddy " + data)})
caddy.stderr.on('data', (data)=>{console.log("caddy " + data)})
caddy.on('close', (code)=>{console.log(`caddy process exited with code ${code}`)})

var Service = {
		Data: {},
		Hostname: 'networktools.uk',
		Express: require('express')(),
		DNS: require('./DNS.js'),
};
Service.ExpressRouter = require('express').Router();
Service.Express.use(function(req, res, next) {
    console.log("HTTP", req.ip, req.headers['host'], req.method, req.url);
    next();
});
Service.Express.use(Service.ExpressRouter);
Service.Express.use(function(req, res) {
	res.set('Refresh', '2;url=/');
	res.status(404);
    res.send("ERROR 404 Not Found");
    console.log("404", req.ip, req.headers['host'], req.method, req.url)
});

async function Init() {
	console.log("Init!");
	try {
		Service.Data = JSON.parse(await fs.readFile('/data/app.json'));
	} catch {}

	Service.HTTP = require('http').Server(Service.Express);
	Service.HTTP.listen(8000, () => console.log(`Listening at http://`));
	
	await Service.DNS.Zone(Service);
	
	Service.IO = require('socket.io')();
	Service.IO.attach(Service.HTTP);

	await fs.writeFile('/data/app.json', JSON.stringify(Service.Data));
    
	Service.StaticFile = async(URL, Filename) => {
		const Cache = await fs.readFile(Filename);
		const Extension = Filename.indexOf('.')>-1?Filename.substr(Filename.lastIndexOf('.')):'sh';
		return Service.ExpressRouter.all(URL, (req, res)=>{
			res.type(Extension);
			res.send(Cache);
		});
	};
	Service.StaticPage = async(URL, Filename) => {
		const { JSDOM } = require("jsdom");
		const jquery = require("jquery");
		const Template = new JSDOM(await fs.readFile('template.html'), {
			runScripts: "outside-only",
		});
		const { window } = Template;
		var $ = jquery(window);
		var HTML = await fs.readFile(Filename);
		$('#Page').empty().html(HTML.toString());
		if ($('#Page title').length) {
			$('title').first().text($('#Page title').remove().text());
		}
		const Cache = Template.serialize();
		if (URL)
			Service.ExpressRouter.all(URL, (req, res)=>{
				res.set('Content-Type', 'text/html');
				res.send(Cache);
			});
		return Cache;
	}
	
	var Files = await fs.readdir("modules");
	for (var x in Files) {
		if (fs.existsSync('modules/' + Files[x] + '/module.js')) {
			console.log('Loading modules/' + Files[x] + '/module.js');
			require('../modules/' + Files[x] + '/module.js')(Service);
		};
	}
}

setTimeout(Init,1000);