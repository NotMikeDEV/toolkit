#!/usr/local/sbin/container
require("module/network")
require("module/caddy")
require("module/php")
local NIC = network:AddInterface{type='ethernet', name='net0', default_route=true}
NIC:AddIP{ipv4='44.131.14.50', ipv6='2a07:1c44:260e::50', nat=true}

function AddProxies(Website)
	Website:AddProxy{source='/dns/', target="http://127.0.0.1:8080"}
	Website:AddProxy{source='/dnstest/', target="http://127.0.0.1:8080"}
	Website:AddProxy{source='/whoami/', target="http://127.0.0.1:8080"}
	Website:AddProxy{source='/pcap/', target="http://127.0.0.1:8080"}
	Website:AddProxy{source='/bgp_advertise/', target="http://127.0.0.1:8080"}
	Website:AddProxy{source='/bgp_data/', target="http://127.0.0.1:8080"}
	Website:AddProxy{source='/lg/', target="http://127.0.0.1:8080"}
	Website:AddProxy{source='/speed/', target="http://127.0.0.1:8080"}
end
local ToolkitAS206671 = caddy:AddWebsite{hostname='', port=80, root='/tools'}
AddProxies(ToolkitAS206671)

network:AddNameserver('9.9.9.9')

function install_container()
	install_package("ca-certificates")
	exec_or_die("wget -O- https://deb.nodesource.com/setup_8.x | bash -")

	install_package("mtr graphviz whois bird .*traceroute iputils-tracepath tshark dnsutils nodejs certbot lua5.2 lua-socket tshark")
	exec_or_die("npm i --save node-dig-dns")
	exec_or_die("npm i --save native-dns")
	exec_or_die("npm i --save ws")
	return 0
end
Mount{path='/tools/', type="map", source="/tools"}
