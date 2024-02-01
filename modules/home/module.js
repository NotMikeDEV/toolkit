const IPAddr = require('ip6addr');

module.exports = async (Service)=>{
	Service.StaticPage('/', 'modules/home/index.html');

	Service.ExpressRouter.get('/.ip', (req,res)=>{
		var IPAddress = IPAddr.parse(req.headers['x-real-ip']);
		if (IPAddress.kind() == 'ipv4')
			IPAddress = IPAddress.toString({format: 'v4'});
		else
			IPAddress = IPAddress.toString({format: 'v6'});
		console.log('WHOAMI IP', IPAddress);
		res.set('Access-Control-Allow-Origin', '*');
		res.set('Content-Type', 'text/plain');
		res.set('Refresh', '0;url=/');
		res.send(IPAddress);
	});
	Service.ExpressRouter.get('/.rdns', (req,res)=>{
		res.set('Content-Type', 'text/plain');
		res.set('Refresh', '0;url=/');
		require('dns').reverse(req.query.ip, (err, hostnames)=>{
			if (hostnames)
				res.send(hostnames.join(' '));
			else
				res.end();
		});
	});
	Service.IO.of('/.dns').on('connect', (socket) => {
		console.log('WHOAMI DNS', socket.client.conn.remoteAddress);
		var TestHost = '_' + Math.random().toString(29).substr(2) + '._' + Math.floor(new Date()) +  '._whoami.dnstest.' + Service.Hostname;
		Service.DNS.register(TestHost, (Question, Response, Request)=>{
			var IPAddress = IPAddr.parse(Request.address.address);
			Response.header.aa = false;
			if (IPAddress.kind() == 'ipv4') {
				Response.authority.push({ type: 2, class: 1,
					name: TestHost,
					data: 'ipv6.' + Service.Hostname,
					ttl: 5,
				});
				IPAddress = IPAddress.toString({format: 'v4'});
			} else {
				Response.authority.push({ type: 2, class: 1,
					name: TestHost,
					data: 'ipv4.' + Service.Hostname,
					ttl: 5,
				});
				IPAddress = IPAddress.toString({format: 'v6'});
			}
			console.log("WHOAMI DNS Request", IPAddress);
			if (Request._socket._remote !== undefined)
				socket.emit('DNS IP', IPAddress);
		});
		socket.emit('probeaddress', TestHost);
		socket.on('disconnect', (reason) => {
			console.log('WHOAMI DNS END ', socket.client.conn.remoteAddress);
			Service.DNS.remove(TestHost);
		});
		setTimeout(()=>socket.disconnect(true),15000);
	});

    function WhoAmI (Hostname) {
        return (Question, Response, Request) => {
            var IPAddress = IPAddr.parse(Request.address.address);
            if (Question.type == 28) {
                if (IPAddress.kind() == 'ipv6') {
                    Response.answer.push({ type: 28, class: 1,
                        name: Hostname,
                        address: IPAddress.toString({format: 'v6'}),
                        ttl: 1,
                    });
                } else {
                    Response.header.aa = false;
                    return Response.authority.push({ type: 2, class: 1,
                        name: Hostname,
                        data: 'ipv6.' + Service.Hostname,
                        ttl: 1,
                    });
                }
            }
            if (Question.type == 1) {
                if (IPAddress.kind() == 'ipv4') {
                    Response.answer.push({ type: 1, class: 1,
                        name: Hostname,
                        address: IPAddress.toString({format: 'v4'}),
                        ttl: 1
                    });
                } else {
                    Response.header.aa = false;
                    return Response.authority.push({ type: 2, class: 1,
                        name: Hostname,
                        data: 'ipv4.' + Service.Hostname,
                        ttl: 1,
                    });
                }
            }
            Response.answer.push({ type: 16, class: 1,
                name: Hostname,
                data: [ 'Query Time', (new Date()).toString() ],
                ttl: 1,
            });
            Response.answer.push({ type: 16, class: 1,
                name: Hostname,
                data: [ 'Query Source IP', IPAddress.toString({format: IPAddress.kind().substr(2)}) ],
                ttl: 1,
            });
            Response.authority.push({ type: 2, class: 1,
                name: Hostname,
                data: 'ipv4.' + Service.Hostname,
                ttl: 30,
            });
            Response.authority.push({ type: 2, class: 1,
                name: Hostname,
                data: 'ipv6.' + Service.Hostname,
                ttl: 30,
            });
            Response.authority.push({ type: 2, class: 1,
                name: Hostname,
                data: Service.Hostname,
                ttl: 30,
            });
        }
    }
	Service.DNS.register('who.' + Service.Hostname, WhoAmI('who.networktools.uk'))
};
