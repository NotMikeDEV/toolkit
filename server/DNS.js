const dns = require('native-dns');
const IPAddr = require('ip6addr');

var DNSRecords = {};

var app = {
	dns,
	Request: dns.Request,
	Question: dns.Question,
	register: (Name, Record) => {
		if (!DNSRecords[Name])
			DNSRecords[Name] = [];
		DNSRecords[Name].push(Record);
	},
	remove: (Name) => {
		delete DNSRecords[Name];
	},
    DNSLookup: async(Hostname)=>{
        try {
            var IPAddress = IPAddr.parse(Hostname);
            if (IPAddress)
                return [IPAddress.toString()];
        } catch{}
        var IPs = [];

        var ReturnIPv6 = false;
        const IPv6Records = new Promise( (resolutionFunc) => {
            ReturnIPv6 = resolutionFunc;
        });
        var req = dns.Request({
            question: dns.Question({name: Hostname, type: "AAAA"}),
            server: { address: "172.20.4.53", type: 'udp' },
            timeout: 5000,
            rd: true,
            try_edns: true,
        });
        req.on('message', (err, answer) => {
            for (var x in answer.answer) {
                if (answer.answer[x].name.toLowerCase() == Hostname.toLowerCase()) {
                    IPs.push(answer.answer[x].address);
                }
            }
            ReturnIPv6();
        });
        req.on('timeout', () => {ReturnIPv6();});
        req.send();

        var ReturnIPv4 = false;
        const IPv4Records = new Promise( (resolutionFunc) => {
            ReturnIPv4 = resolutionFunc;
        });
        var req = dns.Request({
            question: dns.Question({name: Hostname, type: "A"}),
            server: { address: "172.20.4.53", type: 'udp' },
            timeout: 5000,
            rd: true,
            try_edns: true,
        });
        req.on('message', (err, answer) => {
            for (var x in answer.answer) {
                if (answer.answer[x].name.toLowerCase() == Hostname.toLowerCase()) {
                    IPs.push(answer.answer[x].address);
                }
            }
            ReturnIPv4();
        });
        req.on('timeout', () => {ReturnIPv4();});
        req.send();

        var ReturnResult = false;
        const Ret = new Promise( (resolutionFunc) => {
            ReturnResult = resolutionFunc;
        });
        Promise.all([IPv4Records, IPv6Records]).then(()=>{
            ReturnResult(IPs);
        });
        return await Ret;
    },
};

//Handler for DNS queries
async function DNSHandler(request, response) {
	response.header.rcode = 4;
	var question = request.question[0];
	var hostname = question.name.toLowerCase();
	var Host = hostname.split(".");
	console.log("DNS Request", hostname, question.type, request.address.address +"@"+ request.address.port);
	function CheckTree(Host) {
		var Test = Host.join('.');
		if (!DNSRecords[Test] && Host.length > 1)
			return CheckTree(Host.slice(1));
		return DNSRecords[Test];
	}
	var Records = CheckTree(Host);
	
	if (Records && Records.length) {
		response.header.rcode = 0;
		response.header.aa = true;
		for (var x in Records) {
			var Record = Records[x];
			if (typeof Record == 'function') {
				Record(question, response, request);
			} else if (Record.type) {
				if (Record.name == hostname && Record.type == question.type)
					response.answer.push(Record);
				else if (Record.type == 6)
					response.authority.push(Record);
				else if (Record.type == 2)
					response.authority.push(Record);
				else if (Record.name == hostname)
					response.additional.push(Record);
			} else {
				console.log(Record, typeof Record);
			}
		}
	}
	// Send Response
	return response.send();
};
// Error handler
function ErrorHandler(err, buff, req, res) {
	console.log("DNS Server Error", err.stack);
};

console.log("DNS Server UDP", dns.createServer({dgram_type: 'udp6'}).on('request', DNSHandler).on('socketError', ErrorHandler).on('error', ErrorHandler).serve(53));
console.log("DNS Server TCP", dns.createTCPServer({dgram_type: 'tcp6'}).on('request', DNSHandler).on('socketError', ErrorHandler).on('error', ErrorHandler).serve(53));

app.Zone = async function (Service) {
	Service.DNS.register("dnstest." + Service.Hostname, { type: 6, class: 1,
		name: "dnstest." + Service.Hostname,
		ttl: 30,
		primary: Service.Hostname,
		admin: 'AI.dns.cloud',
		serial: 1,
		refresh: 600,
		retry: 600,
		expiration: 3600,
		minimum: 30 }
	);
	Service.DNS.register("dnstest." + Service.Hostname, { type: 2, class: 1,
		name: "dnstest." + Service.Hostname,
		ttl: 300,
		data: "ipv4." + Service.Hostname,
	});
	Service.DNS.register("dnstest." + Service.Hostname, { type: 2, class: 1,
		name: "dnstest." + Service.Hostname,
		ttl: 300,
		data: "ipv6." + Service.Hostname,
	});
    return;
}

async function ProbeHost(Service, Hostname) {
	if (app._Probes[Hostname] === undefined)
		app._Probes[Hostname] = true;
	else
		return;
	
	console.log("Looking up host", Hostname);
	var ReturnIPv4 = false;
	const IPv4Records = new Promise( (resolutionFunc) => {
		ReturnIPv4 = resolutionFunc;
	});
	var ReturnIPv6 = false;
	const IPv6Records = new Promise( (resolutionFunc) => {
		ReturnIPv6 = resolutionFunc;
	});

	var req = Service.DNS.Request({
		question: Service.DNS.Question({name: Hostname, type: "A"}),
		server: { address: "172.20.4.53", type: 'udp' },
		timeout: 3000,
		rd: true,
	});
	req.on('message', async (err, answer) => {
		for (var x in answer.answer) {
			await ProbeIP(Service, answer.answer[x].address);
		}
		ReturnIPv4(answer.answer);
	});
	req.on('timeout', async () => {ReturnIPv4();});
	req.send();

	var req = Service.DNS.Request({
		question: Service.DNS.Question({name: Hostname, type: "AAAA"}),
		server: { address: "172.20.4.53", type: 'udp' },
		timeout: 3000,
		rd: true,
	});
	req.on('message', async (err, answer) => {
		for (var x in answer.answer) {
			await ProbeIP(Service, answer.answer[x].address);
		}
		ReturnIPv6(answer.answer);
	});
	req.on('timeout', async () => {ReturnIPv6();});

	req.send();

	if (await IPv4Records && (await IPv4Records).length && await IPv6Records && (await IPv6Records).length)
		app._Probes[Hostname] = (await IPv4Records).concat(await IPv6Records);
	else if (await IPv4Records)
		app._Probes[Hostname] = await IPv4Records;
	else if (await IPv6Records)
		app._Probes[Hostname] = await IPv6Records;
}

module.exports = app;
