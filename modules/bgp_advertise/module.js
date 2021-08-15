const Tunnels={
    "GWlon": {"Type":"Internal", "Name": "London", "IPv6":"2a05:f480:1000:90f:5400:3ff:fe6d:a19", "ASN":"206671"},
    "GWams": {"Type":"Internal", "Name": "Amsterdam", "IPv6":"2001:19f0:5001:2ecb:5400:3ff:fe6d:5a4", "ASN":"206671"},
    "GWnj": {"Type":"Internal", "Name": "NewJersey", "IPv6":"2001:19f0:5:3562:5400:3ff:fe6e:1376", "ASN":"206671"},
//    "TBus": {"Type":"6in4", "Name": "Fremont", "IPv6":"2a09:4c0:fe0:7e::1", "ASN":"58057", "Local_IPv4":"198.244.131.14", "Local_IPv6":"2a09:4c0:fe0:7e::2/64", "Remote_IPv4":"85.202.203.249"},
    "TBch": {"Type":"6in4", "Name": "Zurich", "IPv6":"2a09:4c0:1e0:120::1", "ASN":"58057", "Local_IPv4":"198.244.131.15", "Local_IPv6":"2a09:4c0:1e0:120::2/64", "Remote_IPv4":"94.177.122.249"},
//    "TBgb": {"Type":"6in4", "Name": "London", "IPv6":"2a09:4c0:57e0:6f::1", "ASN":"58057", "Local_IPv4":"198.244.131.12", "Local_IPv6":"2a09:4c0:57e0:6f::2/64", "Remote_IPv4":"185.232.117.249"},
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
/*Prefix("2a07:1c44:26a0::/48");
Prefix("2a07:1c44:26a1::/48");
Prefix("2a07:1c44:26a2::/48");
Prefix("2a07:1c44:26a3::/48");
Prefix("2a07:1c44:26a4::/48");
Prefix("2a07:1c44:26a5::/48");
Prefix("2a07:1c44:26a6::/48");
Prefix("2a07:1c44:26a7::/48");
Prefix("2a07:1c44:26a8::/48");
Prefix("2a07:1c44:26a9::/48");
Prefix("2a07:1c44:26aa::/48");
Prefix("2a07:1c44:26ab::/48");
Prefix("2a07:1c44:26ac::/48");
Prefix("2a07:1c44:26ad::/48");
Prefix("2a07:1c44:26ae::/48");
Prefix("2a07:1c44:26af::/48");
Prefix("2a07:1c44:26b0::/48");
Prefix("2a07:1c44:26b1::/48");
Prefix("2a07:1c44:26b2::/48");
Prefix("2a07:1c44:26b3::/48");
Prefix("2a07:1c44:26b4::/48");
Prefix("2a07:1c44:26b5::/48");
Prefix("2a07:1c44:26b6::/48");
Prefix("2a07:1c44:26b7::/48");
Prefix("2a07:1c44:26b8::/48");
Prefix("2a07:1c44:26b9::/48");
Prefix("2a07:1c44:26ba::/48");
Prefix("2a07:1c44:26bb::/48");
Prefix("2a07:1c44:26bc::/48");
Prefix("2a07:1c44:26bd::/48");
Prefix("2a07:1c44:26be::/48");
Prefix("2a07:1c44:26bf::/48");
Prefix("2a07:1c44:26c0::/48");
Prefix("2a07:1c44:26c1::/48");
Prefix("2a07:1c44:26c2::/48");
Prefix("2a07:1c44:26c3::/48");
Prefix("2a07:1c44:26c4::/48");
Prefix("2a07:1c44:26c5::/48");
Prefix("2a07:1c44:26c6::/48");
Prefix("2a07:1c44:26c7::/48");
Prefix("2a07:1c44:26c8::/48");
Prefix("2a07:1c44:26c9::/48");
Prefix("2a07:1c44:26ca::/48");
Prefix("2a07:1c44:26cb::/48");
Prefix("2a07:1c44:26cc::/48");
Prefix("2a07:1c44:26cd::/48");
Prefix("2a07:1c44:26ce::/48");
Prefix("2a07:1c44:26cf::/48");
Prefix("2a07:1c44:26d0::/48");
Prefix("2a07:1c44:26d1::/48");
Prefix("2a07:1c44:26d2::/48");
Prefix("2a07:1c44:26d3::/48");
Prefix("2a07:1c44:26d4::/48");
Prefix("2a07:1c44:26d5::/48");
Prefix("2a07:1c44:26d6::/48");
Prefix("2a07:1c44:26d7::/48");
Prefix("2a07:1c44:26d8::/48");
Prefix("2a07:1c44:26d9::/48");
Prefix("2a07:1c44:26da::/48");
Prefix("2a07:1c44:26db::/48");
Prefix("2a07:1c44:26dc::/48");
Prefix("2a07:1c44:26dd::/48");
Prefix("2a07:1c44:26de::/48");
Prefix("2a07:1c44:26df::/48");
Prefix("2a07:1c44:26e0::/48");
Prefix("2a07:1c44:26e1::/48");
Prefix("2a07:1c44:26e2::/48");
Prefix("2a07:1c44:26e3::/48");
Prefix("2a07:1c44:26e4::/48");
Prefix("2a07:1c44:26e5::/48");
Prefix("2a07:1c44:26e6::/48");
Prefix("2a07:1c44:26e7::/48");
Prefix("2a07:1c44:26e8::/48");
Prefix("2a07:1c44:26e9::/48");
Prefix("2a07:1c44:26ea::/48");
Prefix("2a07:1c44:26eb::/48");
Prefix("2a07:1c44:26ec::/48");
Prefix("2a07:1c44:26ed::/48");
Prefix("2a07:1c44:26ee::/48");
Prefix("2a07:1c44:26ef::/48");*/
Prefix("2a07:1c44:26f0::/48");
Prefix("2a07:1c44:26f1::/48");
Prefix("2a07:1c44:26f2::/48");
Prefix("2a07:1c44:26f3::/48");
Prefix("2a07:1c44:26f4::/48");
Prefix("2a07:1c44:26f5::/48");
Prefix("2a07:1c44:26f6::/48");
Prefix("2a07:1c44:26f7::/48");
Prefix("2a07:1c44:26f8::/48");
Prefix("2a07:1c44:26f9::/48");
Prefix("2a07:1c44:26fa::/48");
Prefix("2a07:1c44:26fb::/48");
Prefix("2a07:1c44:26fc::/48");
Prefix("2a07:1c44:26fd::/48");
Prefix("2a07:1c44:26fe::/48");
Prefix("2a07:1c44:26ff::/48");
Bird.COVER_PREFIX = "2a07:1c44:2600::/40";


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