#!/usr/local/sbin/container
require("module/network")
require("module/caddy")
require("module/php")
local NIC = network:AddInterface{type='ethernet', name='net0', default_route=true}
NIC:AddIP{ipv4='44.131.14.81', ipv6='2a07:1c44:260e::81', nat=true}

function AddProxies(Website)
	Website:AddProxy{source='/dns/', target="http://127.0.0.1:8080"}
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
function background()
	exec([[while true; do
		cd /tools/ && ./ToolServer.js
		sleep 1
	done &]])
	return 0
end

Mount{path='/tools/', type="map", source="/cloud/toolkit"}
function init_network_host(pid)
	exec([[ip route add $(ip route list|grep 44.131.14.81|head -n 1|cut -d " " -f 1,2,3) table 20]])
	exec([[ip -6 route add $(ip -6 route list|grep "2a07:1c44:260e::81"|head -n 1|cut -d " " -f 1,2,3) table 20]])
	return 0
end