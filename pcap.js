#!/usr/bin/nodejs
execBG = require('child_process').exec;
fs = require('fs');

RandomString = function(len) {
	var RString = "";
	while (RString.length < len)
		if (Math.random()>=0.8)
			RString += String.fromCharCode((Math.random()*10)+48);
		else if (Math.random()>=0.5)
			RString += String.fromCharCode((Math.random()*26)+65);
		else
			RString += String.fromCharCode((Math.random()*26)+97);
	return RString;
}

module.exports = {
	HTTP: function(req, res, startTime, URL, Path, bodyFilename, bodyLength, SendReply) {
		var responseTime = Date.now();
		var bodyLengthString = bodyLength.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		if (req.method == 'POST' || req.method == 'PUT')
		{
			var User='Public';
			if (Path[Path.length - 1] == "upload" && Path.length > 3)
				User=Path[Path.length - 2].replace(/[^A-Za-z0-9]/g, "-");
			var Filename=User + "." + (new Date()).toISOString().replace(/[-.: ZT]/g, "") + "_" + RandomString(8)+ "." + bodyLength + ".pcap";
			console.log("New capture: " + Filename + " " + (Date.now() - startTime) + "ms/" + (Date.now() - responseTime) + "ms\n");
			var Response={
				filename: Filename,
				id: Filename,
				size: bodyLength,
				};
			execBG("tshark -r " + bodyFilename + " -w /tmp/" + Filename, function(){
				fs.unlink(bodyFilename, function(){});
			});
			return SendReply(200, 'text/json', JSON.stringify(Response));
		}
		if (Path.length == 2 || Path.length == 3 && Path[2] == '')
		{
			var CSharkIndex = "<html>";
			CSharkIndex+= '<SCRIPT src="https://code.jquery.com/jquery-1.12.4.js"></SCRIPT><DIV id="header"><SCRIPT>$(function(){$.ajax({url: "/header.html",}).done(function(data) {$("#header").html(data);});})</SCRIPT></DIV>';
			CSharkIndex+= '<head><title>Cloud packet capture</title></head>';
			CSharkIndex+= '<body>';
			CSharkIndex+= '<p><a href="/pcap/cshark">Cloud Shark Wrapper for Toolkit</a> Save as /sbin/cshark and chmod +x.</p>';
			CSharkIndex+= '<p>Copy/Paste (as root): <PRE>wget -O /sbin/cshark http://tools.as206671.uk/pcap/cshark; chmod +x /sbin/cshark</PRE></p>';
			CSharkIndex+= '<p>To use this server with the OpenWRT CloudShark client, use server URL <b>http://tools.as206671.uk/pcap/</b> and any token.</p>';
			CSharkIndex+= '<p>These tools are provided for the sole purpose of showing how easy remote packet capture can be, not as an actual service. I will wipe the server randomly.</p>';
			CSharkIndex+= '</body>';
			CSharkIndex+= '</html>';

			return SendReply(200, 'text/html', CSharkIndex);
		}
		if (Path[2] == "cshark" && Path.length == 3)
		{
			var CSharkScript = "";
			CSharkScript += '#!/bin/bash' + "\n";
			CSharkScript += 'TEMPFILE=$(tempfile)' + "\n";
			CSharkScript += 'tshark -w "$TEMPFILE" "$@"' + "\n";
			CSharkScript += 'wget --body-file=$TEMPFILE --method=PUT -O "$TEMPFILE.url" -o /dev/null "http://tools.as206671.uk/pcap/$(hostname)/upload" && (' + "\n";
			CSharkScript += '        rm -f "$TEMPFILE"' + "\n";
			CSharkScript += '        URL=$(cat "$TEMPFILE.url"  | python -c "import sys, json; print json.load(sys.stdin)[\'filename\']")' + "\n";
			CSharkScript += '        URL="http://tools.as206671.uk/pcap/captures/$URL"' + "\n";
			CSharkScript += '        echo $URL' + "\n";
			CSharkScript += ') || echo "$TEMPFILE"' + "\n";
			res.writeHead(200, {'Content-Type': 'text/x-shellscript', 'Content-Disposition': 'attachment; filename="cshark"'});
			return res.end(CSharkScript);
		}
		var Command = Path[Path.length-2];
		if (Command == 'captures')
		{
			if (Path.length > 4)
			{
				var Dest = "/pcap/"+ Path[Path.length-2] + "/" + Path[Path.length-1];
				console.log("Returning redirect: " + Dest + " " + (Date.now() - startTime) + "ms/" + (Date.now() - responseTime) + "ms\n");
				res.writeHead(302, {'Location': 'https://tools.as206671.uk' + Dest});
				return res.end("Redirecting to " + Dest);
			}
			if (bodyFilename) fs.unlink(bodyFilename, function(){});
			var Filename = Path[Path.length-1];
			if (fs.existsSync("/tmp//"+Filename))
			{
				console.log("Returning capture: " + Filename + " " + (Date.now() - startTime) + "ms/" + (Date.now() - responseTime) + "ms\n");
				res.writeHead(200, {'Content-Type': 'application/pcap'});
				var readStream = fs.createReadStream("/tmp/"+Filename);
				readStream.on('open', function () {
					readStream.pipe(res);
				});
				readStream.on('error', function(err) {
					res.end(err);
				});
				return;
			}
			else
			{
				return SendReply(404, 'text/plain', "Capture " + Filename + " not found.");
			}
		}
		else
		{
			if (bodyFilename) fs.unlink(bodyFilename, function(){});
			return SendReply(500, 'text/plain', 'Invalid');
		}
	},
};