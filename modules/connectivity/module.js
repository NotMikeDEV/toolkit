const promisify = require('promisify-node');
const fs = promisify('fs');
const child_process = require("child_process")
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { Script } = require("vm");
const jquery = require("jquery");
const DNS = require('../../server/DNS');
const IPAddr = require('ip6addr');
const ping = require('ping');

async function Ping(Target, Hop=64) {
    return await ping.promise.probe(Target, {timeout: 1, extra: ['-t', Hop],});
}
module.exports = async (Service)=>{
	await Service.StaticPage('/connectivity/', 'modules/connectivity/index.html');

	Service.IO.of('/connectivity/').on('connect', (socket) => {
		socket.on('Resolve', async(Hostname, Response) => {
            console.log("Resolve", Hostname);
            const IPs = await DNS.DNSLookup(Hostname);
            console.log("Resolved", Hostname, IPs);
            Response(IPs);
		});
		socket.on('Ping', async(IP, Response) => {
            const Target = IPAddr.parse(IP);
            const Result = await Ping(Target);
            Response(Result);
		});
		socket.on('Trace', async(IP, Response) => {
            const ID = Math.random().toString(36).substr(2)
            Response(ID)
            const Target = IPAddr.parse(IP);
            const T = child_process.spawn("mtr", ['-w', '-i', '0.1', '-Z', '1', '-c', '5', Target.toString()])
            T.stdout.on('data', (data) => {
                socket.emit("trace-" + ID, data.toString())
                console.log(data.toString())
            });
            T.on('close', () => {});
		});
	});
};