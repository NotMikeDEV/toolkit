#!/usr/local/sbin/container
require("module/network")
require("module/caddy")
require("module/php")

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
local ToolkitAS206671 = caddy:AddWebsite{hostname='tools.as206671.uk', port=80, root='/tools'}
AddProxies(ToolkitAS206671)
local ToolkitAS206671 = caddy:AddWebsite{hostname='tools.as206671.uk', port=443, root='/tools'}
AddProxies(ToolkitAS206671)
local ToolkitAS206671 = caddy:AddWebsite{hostname='ipv4.tools.as206671.uk', port=443, root='/tools'}
AddProxies(ToolkitAS206671)
local ToolkitAS206671 = caddy:AddWebsite{hostname='ipv6.tools.as206671.uk', port=443, root='/tools'}
AddProxies(ToolkitAS206671)
local ToolkitM6XCV = caddy:AddWebsite{hostname='toolkit.m6xcv.uk', port=443, root='/tools/'}
AddProxies(ToolkitAS206671)

network:AddNameserver('9.9.9.9')

function background()
--	exec("/root/peervpn-0-044/peervpn /etc/peervpn.conf &")
--	exec("(sleep 2&&ip route add default via 172.31.0.1 table 44)&")
	exec([[while true; do
		cd /tools/ && ./ToolServer.js
		sleep 1
	done &]])
	exec([[wget -O/dev/null -o/dev/null http://127.0.0.1:8080/bgp_advertise/ &]])
	exec([[while true; do
		sleep 300
		cd /tools/bgp_data/ && ./update.js
		sleep 3300
	done &]])
--	exec([[while true; do
--		cd /tools/debug/ && ./rip44.lua
--		sleep 1
--	done &]])
	return 0
end

function install_container()
	install_package("ca-certificates")
	exec_or_die("wget -O- https://deb.nodesource.com/setup_8.x | bash -")

	install_package("mtr graphviz whois bird .*traceroute iputils-tracepath tshark dnsutils nodejs certbot lua5.2 lua-socket tshark")
	exec_or_die("npm i --save node-dig-dns")
	exec_or_die("npm i --save native-dns")
	exec_or_die("npm i --save ws")
	exec_or_die("cd /root;wget -N https://peervpn.net/files/peervpn-0-044-linux-x86.tar.gz")
	exec_or_die("cd /root;tar -zxf peervpn-0-044-linux-x86.tar.gz")
	return 0
end
function apply_config()
	write_file("/etc/peervpn.conf", [[port 77
networkname AS206671-BB
psk AS206671peerVPNmeshSecurePasswordZZZ
enabletunneling yes
interface backbone
ifconfig4 172.31.0.8/16
ifconfig6 2a06:8181:abff:bb::8/64
initpeers hub.as206671.uk 53
initpeers beast.notmike.uk 53
]])
	return 0
end
Mount{path='/tools/', type="map", source="/tools"}
Mount{path='/var/lib/letsencrypt/', type="map", source="letsencrypt"}
Mount{path='/var/log/letsencrypt/', type="map", source="letsencrypt"}
Mount{path='/etc/letsencrypt/', type="map", source="letsencrypt"}
Mount{path='/etc/bird/', type="tmpfs"}
Mount{path='/run/bird/', type="tmpfs"}
