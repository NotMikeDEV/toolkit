<form onsubmit="document.location.href='/'+document.getElementById('lookup').value; return false;">
	<input type="text" placeholder="domain/IP" id="lookup"/>
	<input type="submit" value="Look up"/>
</form>
<pre><?php
if (substr($_SERVER['REQUEST_URI'],1))
{
	passthru("whois " . substr($_SERVER['REQUEST_URI'],1));
}
echo "</pre>";