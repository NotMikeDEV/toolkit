#!/usr/bin/nodejs
fs = require('fs');
var Bird = require("./bird");
function Prefix(Prefix) {
	Bird.AddPrefix(Prefix);
	execBG("ip -6 route add unreachable " + Prefix + " dev lo");
}
Prefix("2a07:1c44:2640::/48");
Prefix("2a07:1c44:2641::/48");
Prefix("2a07:1c44:2642::/48");
Prefix("2a07:1c44:2643::/48");
Prefix("2a07:1c44:2644::/48");
Prefix("2a07:1c44:2645::/48");
Prefix("2a07:1c44:2646::/48");
Prefix("2a07:1c44:2647::/48");
Prefix("2a07:1c44:2648::/48");
Prefix("2a07:1c44:2649::/48");
Prefix("2a07:1c44:264a::/48");
Prefix("2a07:1c44:264b::/48");
Prefix("2a07:1c44:264c::/48");
Prefix("2a07:1c44:264d::/48");
Prefix("2a07:1c44:264e::/48");
Prefix("2a07:1c44:264f::/48");
Prefix("2a07:1c44:2650::/48");
Prefix("2a07:1c44:2651::/48");
Prefix("2a07:1c44:2652::/48");
Prefix("2a07:1c44:2653::/48");
Prefix("2a07:1c44:2654::/48");
Prefix("2a07:1c44:2655::/48");
Prefix("2a07:1c44:2656::/48");
Prefix("2a07:1c44:2657::/48");
Prefix("2a07:1c44:2658::/48");
Prefix("2a07:1c44:2659::/48");
Prefix("2a07:1c44:265a::/48");
Prefix("2a07:1c44:265b::/48");
Prefix("2a07:1c44:265c::/48");
Prefix("2a07:1c44:265d::/48");
Prefix("2a07:1c44:265e::/48");
Prefix("2a07:1c44:265f::/48");
Prefix("2a07:1c44:2660::/48");
Prefix("2a07:1c44:2661::/48");
Prefix("2a07:1c44:2662::/48");
Prefix("2a07:1c44:2663::/48");
Prefix("2a07:1c44:2664::/48");
Prefix("2a07:1c44:2665::/48");
Prefix("2a07:1c44:2666::/48");
Prefix("2a07:1c44:2667::/48");
Prefix("2a07:1c44:2668::/48");
Prefix("2a07:1c44:2669::/48");
Prefix("2a07:1c44:266a::/48");
Prefix("2a07:1c44:266b::/48");
Prefix("2a07:1c44:266c::/48");
Prefix("2a07:1c44:266d::/48");
Prefix("2a07:1c44:266e::/48");
Prefix("2a07:1c44:266f::/48");
Prefix("2a07:1c44:2670::/48");
Prefix("2a07:1c44:2671::/48");
Prefix("2a07:1c44:2672::/48");
Prefix("2a07:1c44:2673::/48");
Prefix("2a07:1c44:2674::/48");
Prefix("2a07:1c44:2675::/48");
Prefix("2a07:1c44:2676::/48");
Prefix("2a07:1c44:2677::/48");
Prefix("2a07:1c44:2678::/48");
Prefix("2a07:1c44:2679::/48");
Prefix("2a07:1c44:267a::/48");
Prefix("2a07:1c44:267b::/48");
Prefix("2a07:1c44:267c::/48");
Prefix("2a07:1c44:267d::/48");
Prefix("2a07:1c44:267e::/48");
Prefix("2a07:1c44:267f::/48");
Prefix("2a07:1c44:2680::/48");
Prefix("2a07:1c44:2681::/48");
Prefix("2a07:1c44:2682::/48");
Prefix("2a07:1c44:2683::/48");
Prefix("2a07:1c44:2684::/48");
Prefix("2a07:1c44:2685::/48");
Prefix("2a07:1c44:2686::/48");
Prefix("2a07:1c44:2687::/48");
Prefix("2a07:1c44:2688::/48");
Prefix("2a07:1c44:2689::/48");
Prefix("2a07:1c44:268a::/48");
Prefix("2a07:1c44:268b::/48");
Prefix("2a07:1c44:268c::/48");
Prefix("2a07:1c44:268d::/48");
Prefix("2a07:1c44:268e::/48");
Prefix("2a07:1c44:268f::/48");
Prefix("2a07:1c44:2690::/48");
Prefix("2a07:1c44:2691::/48");
Prefix("2a07:1c44:2692::/48");
Prefix("2a07:1c44:2693::/48");
Prefix("2a07:1c44:2694::/48");
Prefix("2a07:1c44:2695::/48");
Prefix("2a07:1c44:2696::/48");
Prefix("2a07:1c44:2697::/48");
Prefix("2a07:1c44:2698::/48");
Prefix("2a07:1c44:2699::/48");
Prefix("2a07:1c44:269a::/48");
Prefix("2a07:1c44:269b::/48");
Prefix("2a07:1c44:269c::/48");
Prefix("2a07:1c44:269d::/48");
Prefix("2a07:1c44:269e::/48");
Prefix("2a07:1c44:269f::/48");
Prefix("2a07:1c44:26a0::/48");
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
Prefix("2a07:1c44:26ef::/48");
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
//execBG("ip -6 route add 2a07:1c44:2600::/44 dev lo");
module.exports = {
	HTTP: function(req, res, startTime, URL, Path, bodyFilename, bodyLength, SendReply) {
		if (Path.length == 2)
		{
			res.writeHead(302, {'Location': '/' +Path[1] + '/'});
			return res.end("Not found");
		}
		fs.readFile("bgp_advertise.html", function(err, data){
			return SendReply(200, 'text/html', data);
		});
	},
	WS: function(ws, Path, req) {
		var Free = [];
		var Prefixes = Bird.ListPrefixes(6);
		for (var Prefix in Prefixes)
			if (Prefixes[Prefix].Status == "FREE")
				Free.push(Prefix);
		if (Free.length < 1)
		{
			console.log("No free prefixes");
			return ws.close();
		}
		var Prefix = Free[Math.floor(Math.random() * (Free.length))];
		var IPAddress = req.headers['x-real-ip'];
		if (IPAddress.substr(0,7) == '::ffff:')
			IPAddress = IPAddress.substr(7);
		Prefixes[Prefix].Status = "ALLOCATED";
		ws.send(JSON.stringify({IP:IPAddress, Prefix: Prefix}));
		var Peers = Bird.ListPeers(6);
		for (var x in Peers)
		{
			ws.send(JSON.stringify({Peer: {Name: x, Status: Peers[x].Status}}));
		}
		ws.onmessage = function (event) {
			console.log(Data);
			var Data = JSON.parse(event.data);
			if (Data.Peer)
			{
				Bird.UpdateAdvertisment(Prefix, Data.Peer.Name, Data.Peer);
			}
		};
		ws.onclose = function(){
			Bird.AddPrefix(Prefix);
		};
	},
};
