const { execFile } = require('child_process');
const { writeFile, mkdir } = require('fs');
module.exports = {
    Peers: {},
    Prefixes: {},
    ApplyConfig: async function () {
        var Bird6Conf = "router id 44.131.14.0;\n\n"
            + "protocol kernel {\n"
            + "scan time 60;\n"
            + "import none;\n"
            + "export all;\n"
            + "kernel table 206;\n"
            + "}\n"
            + "protocol device {\n"
            + "scan time 60;\n"
            + "}\n";
        Bird6Conf += "protocol static Prefixes {\n";
        for (var Prefix in this.Prefixes)
        {
           Bird6Conf += "\troute " + Prefix + " via \"lo\";\n";
        }
        if (this.COVER_PREFIX)
           Bird6Conf += "\troute " + this.COVER_PREFIX + " via \"lo\";\n";
        Bird6Conf += "}\n";
        for (let ID in this.Peers)
        {
            Bird6Conf += "protocol bgp BGP_" + ID + " {\n"
                + "\tneighbor " + this.Peers[ID].IPv6 + " as " + this.Peers[ID].ASN + ";\n"
                + "\timport all;\n"
                + "\tlocal as 206671;\n";
            Bird6Conf += "\texport filter {\n";
            for (var Prefix in this.Prefixes)
		    {
                if (this.Prefixes[Prefix].Peers[ID] && this.Prefixes[Prefix].Peers[ID].Enabled)
    			    Bird6Conf += "\t\tif net = " + Prefix + " then accept;\n";
    		}
            if (this.COVER_PREFIX)
                Bird6Conf += "\t\tif net = " + this.COVER_PREFIX + " then {\n"
                    + "\t\t\tbgp_path.prepend(206671);\n"
                    + "\t\t\taccept;\n"
                    + "\t\t}\n";
            Bird6Conf += "\t\treject;\n\t};\n";
            Bird6Conf += "}\n";
        }
        writeFile("/etc/bird/bird6.conf", Bird6Conf, ()=>{
            console.log("Written bird6.conf");
            execFile('birdc6', ['configure'], (error, stdout, stderr) => {console.log(error, stdout, stderr)});
        });
    }
};

mkdir("/run/bird", ()=>{
    execFile('bird6', [], (error, stdout, stderr) => {
        console.log(error, stdout, stderr)
        module.exports.ApplyConfig();
    });
});
