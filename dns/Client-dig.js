var Inited=false;
var List={};
function Init(){
	if (Inited) return; else Inited++;
	var Types=['ANY', 'A', 'AAAA', 'MX', 'TXT', 'NS', 'SRV', 'SOA', 'PTR', 'CNAME'];
	for(var x in Types)
	{
		var Option = $('<OPTION>').text(Types[x]).val(Types[x]).appendTo($('#types'));
	}
	$('#sndBtn').button().css("width", "100%");
	$('#QueryForm').submit(function(){
		List={};
		var QueryData={};
		QueryData.QNAME= $('#q').val();
		QueryData.Type= $('#types').val();
		QueryData.Server = $('#s').val()?$('#s').val():'a.root-servers.net';
		if ($('#R').is(':checked')) QueryData.RD=true;
		location.href="#:" + JSON.stringify(QueryData);
		StartLookup(QueryData);
		return false;
	});
	$('#types').css("width", "100%");
	$('#q').addClass("ui-corner-all").addClass("ui-widget").css("width", "100%");
	$('#s').addClass("ui-corner-all").addClass("ui-widget").css("width", "100%");
	LookupFromURL();
};
function LookupFromURL() {
	var DATA = decodeURI(location.hash);
	if (DATA.substr(0,2) == '#:') try{
		var QueryData = JSON.parse(DATA.substr(2));
		$('#R').prop("checked", QueryData.RD?true:false);
		$('#s').val(QueryData.Server=='a.root-servers.net'?'':QueryData.Server);
		$('#types').val(QueryData.Type);
		StartLookup(QueryData);
	} catch(E) {console.error(DATA.substr(2),E);}
}
window.onhashchange = LookupFromURL;

function StartLookup(QueryData){
	var Results=DNSTraversal(QueryData)
		.appendTo($('#RESULTS').empty());
}

function DNSTraversal(QueryData)
{
	var Server=QueryData.Server;
	var Scope=QueryData.Scope;
	var Hostname=QueryData.QNAME;
	var Type=QueryData.Type;
	var RD=QueryData.RD;
	var IDString = Scope+"_"+Server+"_X_"+Hostname+"_"+Type;
		IDString = IDString.replace(/[\.:]/g,"_");
	if (!List[IDString])
	{
		List[IDString] = {
			Server:Server, Scope:Scope, Hostname:Hostname, Type:Type, RD
		};
		SendRequest(IDString, Server, Scope, Hostname, Type, RD);
	}
	else
	{
		setTimeout(function(){
			RenderRequest(IDString);
		},0);
	}
	return $('<DIV>').addClass(IDString).text("Loading...");
}
function SendRequest(IDString, Server, Scope, Hostname, Type, RD)
{
	$.ajax({
		url: "/dns/DIG/" + Server + "/" + Hostname,
		method: "POST",
		timeout: 20000,
		data: JSON.stringify({
			Server: Server,
			Hostname: Hostname,
			Type: Type,
			RD: RD,
		}),
		dataType: 'json'
	}).done(function(data) {
		if (data && List[IDString])
		{
			console.log(IDString, data);
			List[IDString].Results = data;
			RenderRequest(IDString);
		}
	}).error(function(err) {
		console.log(err);
	});
}
function RenderRequest(IDString)
{
	if (!List[IDString].Results)
		return;
	var data = List[IDString].Results;
	var Server = List[IDString].Server;
	var Scope = List[IDString].Scope;
	var Hostname = List[IDString].Hostname;
	var Type = List[IDString].Type;
	var RD = List[IDString].RD;
	var ResultDIVs=$('.' + IDString).empty()
		.append($('<A>').text("See results").prop('href', '#'+IDString));

	var ResultDIV=$('.' + IDString).first().empty();
		$('<A>').appendTo(ResultDIV).prop('name', IDString)
			.css("position", "relative").css("top", "-20px");

	var Response = $('<PRE>').appendTo(ResultDIV);
	var ShowResponseButton = $('<A>').prop('href','#'+IDString).button().appendTo(ResultDIV).hide()
		.html('Show reply from ' + Server).css("color", "#050").click(function(){
			Response.show();
			ShowResponseButton.hide();
		});
	$('<DIV>').appendTo(ResultDIV).height(10);
	var Referrals = $('<DIV>').appendTo(ResultDIV);
	for (var x in data.header)
		$('<DIV>').appendTo(Response).css("color", "#555")
			.text(data.header[x]);

	if (data.question)
	{
		$('<DIV>').appendTo(Response).height(10);
		$('<B>').appendTo(Response).text('Question');
		var Section = $('<TABLE>').appendTo(Response);
		for (var x in data.question)
		{
			var Row = $('<TR>').appendTo(Response);
			for (var y in data.question[x])
				$('<TD>').appendTo(Row).text(data.question[x][y] + "\t");
		}
	}
	if (data.answer)
	{
		$('<DIV>').appendTo(Response).height(10);
		$('<B>').appendTo(Response).text('Answer');
		var Section = $('<TABLE>').appendTo(Response);
		for (var x in data.answer)
		{
			var Row = $('<TR>').appendTo(Response);
			for (var y in data.answer[x])
				$('<TD>').appendTo(Row).text(data.answer[x][y] + "\t");
			var Name = data.answer[x]['domain'];
			if (!Scope || Name.substr(Name.length-Scope.length) == Scope)
				Row.css("color", "#050");
			else
				Row.css("color", "#550");
		}
	}
	if (data.authority)
	{
		$('<DIV>').appendTo(Response).height(10);
		$('<B>').appendTo(Response).text('Authority');
		var Section = $('<TABLE>').appendTo(Response);
		for (var x in data.authority)
		{
			var Row = $('<TR>').appendTo(Response);
			for (var y in data.authority[x])
				$('<TD>').appendTo(Row).text(data.authority[x][y] + "\t");
			var Name = data.authority[x][0];
			if (!Scope || Name.substr(Name.length-Scope.length) == Scope)
				Row.css("color", "#050");
			else
				Row.css("color", "#550");
		}

	}
	if (data.additional)
	{
		$('<DIV>').appendTo(Response).height(10);
		$('<B>').appendTo(Response).text('Additional');
		var Section = $('<TABLE>').appendTo(Response);
		for (var x in data.additional)
		{
			var Row = $('<TR>').appendTo(Response);
			for (var y in data.additional[x])
				$('<TD>').appendTo(Row).text(data.additional[x][y] + "\t");
			var Name = data.additional[x]['domain'];
			if (!Scope || Name.substr(Name.length-Scope.length) == Scope)
				Row.css("color", "#050");
			else
				Row.css("color", "#550");
		}
	}
	if (data.server)
	{
		$('<DIV>').appendTo(Response).height(10);
		$('<DIV>').appendTo(Response).text(';; Query time: ' + data.time + 'ms');
		$('<DIV>').appendTo(Response).text(';; SERVER: ' + data.server);
		$('<DIV>').appendTo(Response).text(';; WHEN: ' + data.datetime);
		$('<DIV>').appendTo(Response).text(';; MSG SIZE: ' + data.size);
	}
	var IsReferral=data.authority?true:false;
	if (data.answer)
		IsReferral=false;
	if (!data.authority || data.authority.length <1)
		IsReferral=false;
	else
	{
		var GotNS=false;
		for (var x in data.authority)
			if (data.authority[x][3] == 'NS')
				GotNS=true;
		if (!GotNS)
			IsReferral=false;
	}
	if (IsReferral)
	{
		ShowResponseButton.show();
		Response.hide();
		for (var x in data.authority)
		{
			var RName = data.authority[x][0];
			var RTTL = data.authority[x][1];
			var RType = data.authority[x][3];
			var RValue = data.authority[x][4];
			if (data.authority[x][3] == 'NS' && (!Scope || (RName.substr(RName.length-Scope.length) == Scope && RName.length>Scope.length)))
			{
				var GotGlue=false;
				if (data.additional) for (var y in data.additional)
				{
					if (data.additional[y]['domain'] == RValue && (data.additional[y]['type'] == 'A' || data.additional[y]['type'] == 'AAAA'))
					{
						GotGlue=true;
						var ServerIP = data.additional[y]['value'];
						var Row = $('<TR>').appendTo(Referrals);
						var DLG = $('<TD>').appendTo(Row)
							.addClass("ui-widget");
						$('<DIV>').appendTo(DLG)
							.addClass("ui-corner-top").addClass("ui-dialog-titlebar").addClass("ui-widget").addClass("ui-widget-header")
							.text(RValue + ' [' + data.additional[y]['value'] +']');
						DNSTraversal({Server:ServerIP, Scope:RName, QNAME:Hostname, Type:Type, RD:RD}).appendTo(DLG)
							.addClass("ui-corner-bottom").addClass("ui-widget-content").addClass("ui-widget").css("padding", "10px");
					}
					console.log(RValue, data.additional[y]['domain']);
				}
				if (!GotGlue)
				{
					var Row = $('<TR>').appendTo(Referrals);
					var DLG = $('<TD>').appendTo(Row)
						.addClass("ui-widget");
					$('<DIV>').appendTo(DLG)
						.addClass("ui-corner-top").addClass("ui-dialog-titlebar").addClass("ui-widget").addClass("ui-widget-header")
						.text(RValue);
					DNSTraversal({Server:RValue, Scope:RName, QNAME:Hostname, Type:Type, RD:RD}).appendTo(DLG)
						.addClass("ui-corner-bottom").addClass("ui-widget-content").addClass("ui-widget").css("padding", "10px");
				}
			}
		}
	}
	else
	{
		ShowResponseButton.hide();
		Response.show();
	}
}