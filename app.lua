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
	Website:AddProxy{source='/.git/', target="http://127.0.0.1:8080"}
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
local Whois = caddy:AddWebsite{hostname='whois.as206671.uk', port=443, root='/tools/'}
Whois:AddRewrite{source='/.*', target='/whois.php'}

network:AddNameserver('1.1.1.1')
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
	exec("sleep 5; wget -O/dev/null http://127.0.0.1/bgp_advertise/");
	return 0
end

function install_container()
	install_package("ca-certificates tor")
	exec_or_die("wget -O- https://deb.nodesource.com/setup_12.x | bash -")

	install_package("mtr graphviz whois bird .*traceroute iputils-tracepath tshark dnsutils nodejs certbot lua5.2 lua-socket tshark")
	exec_or_die("npm i --save node-dig-dns")
	exec_or_die("npm i --save native-dns")
	exec_or_die("npm i --save ws")
	exec_or_die("npm i --save whois")
	exec_or_die("cd /root;wget -N https://peervpn.net/files/peervpn-0-044-linux-x86.tar.gz")
	exec_or_die("cd /root;tar -zxf peervpn-0-044-linux-x86.tar.gz")
	return 0
end

Mount{path='/tools/', type="map", source="/tools"}
Mount{path='/var/lib/letsencrypt/', type="map", source="letsencrypt"}
Mount{path='/var/log/letsencrypt/', type="map", source="letsencrypt"}
Mount{path='/etc/letsencrypt/', type="map", source="letsencrypt"}
Mount{path='/etc/bird/', type="tmpfs"}
Mount{path='/run/bird/', type="tmpfs"}

-- Tor Thingy
Mount{path='/lib/modules/', type="map", source="/lib/modules/"}
function run()
	exec_or_die("modprobe ip6table_nat")
	exec("ip -6 rule add from 2a07:1c44:2640::/48 lookup 101")
	exec("ip6tables -t nat -D PREROUTING -p tcp -d 2a07:1c44:2640::/48 -j REDIRECT --to-ports 9040")
	exec_or_die("ip6tables -t nat -A PREROUTING -p tcp -d 2a07:1c44:2640::/48 -j REDIRECT --to-ports 9040")
	exec("ip6tables -t nat -D PREROUTING -p udp -d 2a07:1c44:2640::/48 -j REDIRECT --to-ports 9053")
	exec_or_die("ip6tables -t nat -A PREROUTING -p udp -d 2a07:1c44:2640::/48 -j REDIRECT --to-ports 9053")
	exec_or_die("tor")
	return 0
end
function apply_config()
	write_file("/etc/tor/torrc", [[
TransPort [::]:9040
VirtualAddrNetworkIPv6 2a07:1c44:2640::/48
AutomapHostsOnResolve 1
DNSPort [::]:9053

RunAsDaemon 1
ORPort 9001
Address tools.as206671.uk
Nickname as206671
DirPort 9030 # what port to advertise for directory connections
ExitPolicy reject *:* # no exits allowed
BridgeRelay 1
]])
	return 0
end
