var Inited=false;
var List={};
function Init(){
	if (Inited) return; else Inited++;
	var Types=['A', 'AAAA', 'MX', 'TXT', 'NS', 'SRV', 'SOA', 'PTR', 'CNAME', 'ANY'];
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
		$('#q').val(QueryData.QNAME);
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
		SendRequest(IDString, Server, Scope, Hostname, Type, RD, RenderRequest);
	}
	else
	{
		setTimeout(function(){
			RenderRequest(IDString);
		},0);
	}
	return $('<DIV>').addClass(IDString).text("Loading...");
}
function SendRequest(IDString, Server, Scope, Hostname, Type, RD, Callback)
{
	$.ajax({
		url: "/dns/LOOKUP/" + Server + "/" + Hostname,
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
			Callback(IDString);
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
		$('<SPAN>').appendTo(Response).css("color", "#555")
			.text(x + "=" + data.header[x] +",");

	var Answer = $('<TABLE>').appendTo(Response);
	if (data.question)
	{
		$('<B>').appendTo($('<TD>').appendTo($('<TR>').appendTo(Answer)).prop("colspan", 4)).text('Question');
		for (var x in data.question)
		{
			var Row = $('<TR>').appendTo(Answer);
			$('<TD>').appendTo(Row).text(data.question[x].name);
			$('<TD>').appendTo(Row).text(data.question[x].type);
		}
	}
	if (data.answer)
	{
		$('<B>').appendTo($('<TD>').appendTo($('<TR>').appendTo(Answer)).prop("colspan", 4)).text('Answer');
		for (var x in data.answer)
		{
			var Row = $('<TR>').appendTo(Answer);
			$('<TD>').appendTo(Row).text(data.answer[x].name);
			$('<TD>').appendTo(Row).text(data.answer[x].ttl);
			$('<TD>').appendTo(Row).text(data.answer[x].class);
			$('<TD>').appendTo(Row).text(data.answer[x].type);
			$('<TD>').appendTo(Row).text(data.answer[x].address||data.answer[x].data);
			var Name = data.answer[x].name;
			if (!Scope || Name.substr(Name.length-Scope.length) == Scope)
				Row.css("color", "#050");
			else
				Row.css("color", "#550");
		}
	}
	if (data.authority)
	{
		$('<B>').appendTo($('<TD>').appendTo($('<TR>').appendTo(Answer)).prop("colspan", 4)).text('Authority');
		for (var x in data.authority)
		{
			var Row = $('<TR>').appendTo(Answer);
			$('<TD>').appendTo(Row).text(data.authority[x].name);
			$('<TD>').appendTo(Row).text(data.authority[x].ttl);
			$('<TD>').appendTo(Row).text(data.authority[x].class);
			$('<TD>').appendTo(Row).text(data.authority[x].type);
			$('<TD>').appendTo(Row).text(data.authority[x].address||data.authority[x].data);
			var Name = data.authority[x].name;
			if (!Scope || Name.substr(Name.length-Scope.length) == Scope)
				Row.css("color", "#050");
			else
				Row.css("color", "#550");
		}

	}
	if (data.additional)
	{
		$('<B>').appendTo($('<TD>').appendTo($('<TR>').appendTo(Answer)).prop("colspan", 4)).text('Additional');
		for (var x in data.additional)
		{
			var Row = $('<TR>').appendTo(Answer);
			$('<TD>').appendTo(Row).text(data.additional[x].name);
			$('<TD>').appendTo(Row).text(data.additional[x].ttl);
			$('<TD>').appendTo(Row).text(data.additional[x].class);
			$('<TD>').appendTo(Row).text(data.additional[x].type);
			$('<TD>').appendTo(Row).text(data.additional[x].address||data.additional[x].data);
			var Name = data.additional[x].name;
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
	var IsReferral=data.header.aa?false:true;
	if (data.answer.length)
		{console.log("Answer!");IsReferral=false;}
	if (!data.authority || data.authority.length <1)
		{console.log("No Authority!");IsReferral=false;}
	else
	{
		var GotNS=false;
		for (var x in data.authority)
			if (data.authority[x].type == 'NS')
				GotNS=true;
		if (!GotNS)
			{console.log("No NS!");IsReferral=false;}
	}
	if (IsReferral)
	{
		ShowResponseButton.show();
		Response.hide();
		for (var x in data.authority)
		{
			var RName = data.authority[x].name;
			var RTTL = data.authority[x].ttl;
			var RType = data.authority[x].type;
			var RValue = data.authority[x].data;
			if (RType == 'NS' && (!Scope || (RName.substr(RName.length-Scope.length) == Scope && RName.length>Scope.length)))
			{
				var GotGlue=false;
				if (data.additional) for (var y in data.additional)
				{
					if (data.additional[y].name == RValue && (data.additional[y].type == 'A' || data.additional[y].type == 'AAAA'))
					{
						GotGlue=true;
						var ServerIP = data.additional[y].address;
						var Row = $('<TR>').appendTo(Referrals);
						var DLG = $('<TD>').appendTo(Row)
							.addClass("ui-widget");
						$('<DIV>').appendTo(DLG)
							.addClass("ui-corner-top").addClass("ui-dialog-titlebar").addClass("ui-widget").addClass("ui-widget-header")
							.text(RValue + ' [' + ServerIP +']');
						DNSTraversal({Server:ServerIP, Scope:RName, QNAME:Hostname, Type:Type, RD:RD}).appendTo(DLG)
							.addClass("ui-corner-bottom").addClass("ui-widget-content").addClass("ui-widget").css("padding", "10px");
					}
					console.log(RValue, data.additional[y].name);
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