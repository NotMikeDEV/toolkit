#!/usr/bin/nodejs
fs = require('fs');

var Peers={
	4: {},
	6: {},
};
var Prefixes={
	4: {},
	6: {},
};
function ApplyBirdConfig() {
	var bird_common = "router id 44.131.14.8;\n\n";
bird_common+="protocol kernel LocalTable {\n";
bird_common+="\tscan time 10;\n";
bird_common+="\texport none;\n";
bird_common+="\timport all;\n";
bird_common+="\tpreference 1000;\n";
bird_common+="\tdevice routes;\n";
bird_common+="\tlearn on;\n";
bird_common+="}\n";
bird_common+="protocol direct {\n";
bird_common+="\texport none;\n";
bird_common+="\timport all;\n";
bird_common+="\tpreference 1000;\n";
bird_common+="}\n";
bird_common+="protocol device {\n";
bird_common+="\tscan time 5;\n";
bird_common+="\texport none;\n";
bird_common+="\timport all;\n";
bird_common+="\tpreference 1000;\n";
bird_common+="};\n";
	var bird_conf = bird_common;
	var bird6_conf = bird_common;

	bird_conf += "protocol static Prefixes {\n";
	for (var Prefix in Prefixes[4])
	{
		bird_conf += "\troute " + Prefix + " via \"lo\";\n";
	}
	bird_conf += "}\n";
	bird6_conf += "protocol static Prefixes {\n";
	for (var Prefix in Prefixes[6])
	{
		bird6_conf += "\troute " + Prefix + " via \"lo\";\n";
	}
	bird6_conf += "}\n";

	for (var Name in Peers[4])
	{
		var Peer = Peers[4][Name];
		bird_conf += "protocol bgp BGP_" + Name + " {\n";
		bird_conf += "\timport all;\n";
		bird_conf += "\texport filter {\n";
		for (var Prefix in Prefixes[4]) if (Prefixes[4][Prefix].Peers[Name] && Prefixes[4][Prefix].Peers[Name].Enabled)
		{
			bird_conf += "\t\tif net = " + Prefix + " then accept;\n";
		}
		bird_conf += "\t\treject;\n";
		bird_conf += "\t};\n";
		bird_conf += "\tlocal as 206671;\n";
		bird_conf += "\tneighbor " + Peer.IP + " as " + Peer.ASN + ";\n";
		bird_conf += "}\n";
	}
	
	for (var Name in Peers[6])
	{
		var Peer = Peers[6][Name];
		bird6_conf += "protocol bgp BGP_" + Name + " {\n";
		bird6_conf += "\timport all;\n";
		bird6_conf += "\texport filter {\n";
		for (var Prefix in Prefixes[6]) if (Prefixes[6][Prefix].Peers[Name] && Prefixes[6][Prefix].Peers[Name].Enabled)
		{
			bird6_conf += "\t\tif net = " + Prefix + " then accept;\n";
		}
		bird6_conf += "\t\treject;\n";
		bird6_conf += "\t};\n";
		bird6_conf += "\tlocal as 206671;\n";
		bird6_conf += "\tneighbor " + Peer.IP + " as " + Peer.ASN + ";\n";
		bird6_conf += "}\n";
	}
	
	
	fs.writeFile("/etc/bird/bird.conf", bird_conf, function(){
		execBG("birdc conf || bird", function(err, stdout, stderr){
			if (err)
				console.log("bird", err, stdout, stderr);
		});
	});
	fs.writeFile("/etc/bird/bird6.conf", bird6_conf, function(){
		execBG("birdc6 conf || bird6", function(err, stdout, stderr){
			if (err)
				console.log("bird6", err, stdout, stderr);
		});
	});
}ApplyBirdConfig();

module.exports = {
	ListPeers: function(Proto) {
		return Peers[Proto];
	},
	AddPeer: function(Name, IP, ASN) {
		if (IP.indexOf(":") > -1)
		{
			if (!Peers[6][Name])
				Peers[6][Name]={IP:IP, ASN:ASN, Status: "DOWN"};
			else
				Peers[6][Name].IP=IP;
		}
		else
		{
			if (!Peers[4][Name])
				Peers[4][Name]={IP:IP, ASN:ASN, Status: "DOWN"};
			else
				Peers[4][Name].IP=IP;
		}
		ApplyBirdConfig();
	},
	AddPrefix: function(Prefix) {
		if (Prefix.indexOf(":") > -1)
		{
			Prefixes[6][Prefix]={IP:Prefix, Status:"FREE", Peers:{}};
		}
		else
		{
			Prefixes[4][Prefix]={IP:Prefix, Status:"FREE", Peers:{}};
		}
		ApplyBirdConfig();
	},
	ListPrefixes: function(Proto) {
		return Prefixes[Proto];
	},
	UpdateAdvertisment: function(Prefix, Peer, Advertisment) {
		if (Prefix.indexOf(":") > -1)
		{
			Prefixes[6][Prefix].Peers[Peer] = Advertisment;
		}
		else
		{
			Prefixes[4][Prefix].Peers[Peer] = Advertisment;
		}
		ApplyBirdConfig();
	},
};
var Table=101;
function AddTB(Name, Remote, Local, Prefix) {
	execBG("ip tunnel add TB_"+Name+" mode sit remote "+Remote+" local "+Local+" ttl 255 "
		+ " ; " + "ip link set TB_"+Name+" up"
		+ " ; " + "ip addr add "+Prefix+"2/64 dev TB_"+Name
		+ " ; " + "ip -6 rule add from "+Prefix+"2/128 lookup "+ Table
		+ " ; " + "ip -6 route add default dev TB_"+Name+" table "+ Table
	);
	Table++;
	module.exports.AddPeer(Name, Prefix+"1", 6939);
}
AddTB("London", "216.66.84.50", "51.75.162.83", "2001:470:11:64::");
AddTB("Frankfurt", "216.66.84.54", "51.77.100.229", "2001:470:12:93::");
AddTB("Miami", "216.66.70.2", "51.77.100.231", "2001:470:10:ac::");
AddTB("Freemont", "64.71.128.26", "51.77.100.230", "2001:470:d6:26::");
AddTB("HongKong", "216.218.221.2", "51.77.100.228", "2001:470:17:6e::");