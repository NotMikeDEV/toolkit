const Tunnels={
    "GWlon": {"Type":"Internal", "Name": "London", "IPv6":"2001:19f0:7400:8516:5400:04ff:fe52:46be", "ASN":"206671"},
    "GWams": {"Type":"Internal", "Name": "Amsterdam", "IPv6":"2001:19f0:5001:1b0:5400:04ff:fe52:46d7", "ASN":"206671"},
     "R64ams": {"Type":"6in4", "Name": "Route64 Amsterdam", "IPv6":"2a0f:5707:abf8:96::1", "ASN":"212895", "Local_IPv6":"2a0f:5707:abf8:96::2/64", "Local_IPv4":"51.195.235.164", "Remote_IPv4":"198.140.141.168"},
     "R64kans": {"Type":"6in4", "Name": "Route64 Kansas", "IPv6":"2a0f:5707:abf9:f::1", "ASN":"212895", "Local_IPv6":"2a0f:5707:abf9:f::2/64", "Local_IPv4":"198.244.131.14", "Remote_IPv4":"165.140.142.113"},

         
 };
const { execFile } = require('child_process');
for (let ID in Tunnels) {
    if (Tunnels[ID].Type == "6in4") {
        execFile('ip', ['address', 'add', Tunnels[ID].Local_IPv4+"/32", 'dev', 'lo'], (error, stdout, stderr) => {
            execFile('ip', ['tunnel', 'add', ID, 'mode', 'sit', 'local', Tunnels[ID].Local_IPv4, 'remote', Tunnels[ID].Remote_IPv4, 'ttl', '64'], (error, stdout, stderr) => {
                execFile('ip', ['link', 'set', ID, 'up'], (error, stdout, stderr) => {
                });
                execFile('ip', ['addr', 'add', Tunnels[ID].Local_IPv6, 'dev', ID], (error, stdout, stderr) => {
                });
            });
        });
    }
}

const Bird = require('./bird.js');
Bird.Peers = Tunnels;
function Prefix(Prefix) {
    Bird.Prefixes[Prefix] = {Enabled: false, Peers: {}};
    execFile('ip', ['address', 'add', Prefix, 'dev', 'lo'], (error, stdout, stderr) => {});
    execFile('ip', ['-6', 'rule', 'del', 'from', Prefix, 'lookup', '206', 'prio','200'], (error, stdout, stderr) => {
        execFile('ip', ['-6', 'rule', 'add', 'from', Prefix, 'lookup', '206', 'prio','200'], (error, stdout, stderr) => {});
    });
}
Prefix("2a10:cc42:111::/48");
Prefix("2a10:cc42:112::/48");
Prefix("2a10:cc42:113::/48");
Prefix("2a10:cc42:114::/48");
Prefix("2a10:cc42:115::/48");
Prefix("2a10:cc42:116::/48");
Prefix("2a10:cc42:117::/48");
Prefix("2a10:cc42:118::/48");
Prefix("2a10:cc42:119::/48");
Prefix("2a10:cc42:11a::/48");
Prefix("2a10:cc42:11b::/48");
Prefix("2a10:cc42:11c::/48");
Prefix("2a10:cc42:11d::/48");
Prefix("2a10:cc42:11e::/48");

Bird.COVER_PREFIX = "2a10:cc42:11f::/48";

module.exports = async (Service)=>{
	Service.StaticPage('/bgp_advertise/', 'modules/bgp_advertise/index.html');
    Service.IO.of('/.bgp/').on('connect', (socket) => {
		socket.on('message', async(Request, Response) => {
   			console.log(Request);
            if (Request.type == 'init') {
                let MyPrefix = false;
                for (let IPv6 in Bird.Prefixes) {
                    if ( ! Bird.Prefixes[IPv6].Allocated ) {
                        if (!MyPrefix || !Bird.Prefixes[IPv6].Last || (Bird.Prefixes[MyPrefix].Last && Bird.Prefixes[IPv6].Last < Bird.Prefixes[MyPrefix].Last))
                        MyPrefix = IPv6;
                    }
                }
                if (MyPrefix) {
                    Bird.Prefixes[MyPrefix] = { Allocated: true, Peers: {} };
                    socket.Prefix = MyPrefix;
                }
                let Res = {type:'init', Prefix: MyPrefix, Peers: {}};
                for (let ID in Tunnels)
                    Res.Peers[ID] = "AS" + Tunnels[ID].ASN + " - " + Tunnels[ID].Name;
                Response(Res);
            }
            if (socket.Prefix && Request.type == 'enable') {
                if (!Bird.Prefixes[socket.Prefix].Peers[Request.Peer])
                    Bird.Prefixes[socket.Prefix].Peers[Request.Peer] = {Enabled: false, Communities: {}};
                Bird.Prefixes[socket.Prefix].Peers[Request.Peer].Enabled = Request.Enabled;
                Bird.ApplyConfig();
                Response(Bird.Prefixes[socket.Prefix].Peers[Request.Peer]);
            }
            if (socket.Prefix && Request.type == 'addcommunity') {
                if (!Bird.Prefixes[socket.Prefix].Peers[Request.Peer])
                    Bird.Prefixes[socket.Prefix].Peers[Request.Peer] = {Enabled: false, Communities: {}};
                const CommunityString = Request.Community;
                if (CommunityString.indexOf(':') == -1)
                    return Response({Error: "Invalid Format"});
                const Community = [
                    CommunityString.substring(0,CommunityString.indexOf(':')),
                    CommunityString.substring(CommunityString.indexOf(':')+1)
                ];
                console.log(CommunityString, (Community[0]+0) + ":" + (Community[1]+0))
                if (CommunityString != parseInt(Community[0]) + ":" + parseInt(Community[1]))
                    return Response({Error: "Invalid Format"});
                Bird.Prefixes[socket.Prefix].Peers[Request.Peer].Communities[CommunityString] = [Community[0], Community[1]];
                Bird.ApplyConfig();
   			    console.log(Bird.Prefixes[socket.Prefix].Peers);
                Response({OK:true, ...Bird.Prefixes[socket.Prefix].Peers[Request.Peer]});
            }
		});
        socket.on('disconnect', (reason)=>{
            if (socket.Prefix)
                Bird.Prefixes[socket.Prefix] = {Enabled: false, Peers: {}, Last: new Date()};
            Bird.ApplyConfig();
        });
	});

};