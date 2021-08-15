const promisify = require('promisify-node');
const acme = require('acme-client');
const x509 = require('x509');
const fs = promisify('fs');

//const Directory = acme.directory.letsencrypt.staging;
const Directory = acme.directory.letsencrypt.production;

// Retrieve account from DB, create new one if required.
async function ACMEClient(Service) {
    var Account = Service.Data.ACMEAccount;
    if (!Account) { // New ACME Account
        Account = {
            directoryUrl: Directory,
            accountKey: (await acme.forge.createPrivateKey()).toString()
        };
        var client = new acme.Client(Account);
        var Response = await client.createAccount({
            termsOfServiceAgreed: true,
            contact: ['mailto:acme@server.email']
        });
        Account.accountUrl = client.api.accountUrl;
        console.log("Created ACME account", Account);
        Service.Data.ACMEAccount = Account;
    }

    var client = new acme.Client(Account);
    return client;
}

// Provision a new TLS certificate
async function Provision(Service) {
	var CA = await ACMEClient(Service);
	var RequestedNames = [];
	RequestedNames.push({ type: 'dns', value: Service.Hostname });
	RequestedNames.push({ type: 'dns', value: 'ipv4.' + Service.Hostname });
	RequestedNames.push({ type: 'dns', value: 'ipv6.' + Service.Hostname });
	Order = await CA.createOrder({identifiers: RequestedNames});
	var auths = await CA.getAuthorizations(Order);
	for (x in auths)
	{
		var auth = auths[x];
		console.log("Requesting TLS for", auth.identifier.value);
		for (y in auth.challenges)
		{
			var challenge = auth.challenges[y];
			if (challenge.type == 'http-01')
			{
				const keyAuthorization = await CA.getChallengeKeyAuthorization(challenge);
				console.log("ACME Challenge", auth.identifier.value, challenge.token, keyAuthorization);
				Service.ExpressRouter.get('/.well-known/acme-challenge/' + challenge.token, (req, res)=>{
					console.log('GET request to ' + req.path);
					res.send(keyAuthorization);
				});
				await CA.verifyChallenge(auth, challenge);
				await CA.completeChallenge(challenge);
				console.log("ACME Validation Response", await CA.waitForValidStatus(challenge));
			}
		};
	};
	// Provision Certificate
	var CertNames = {
		commonName: Service.Hostname,
		altNames: []
	}
	CertNames.altNames.push('ipv4.' + Service.Hostname);
	CertNames.altNames.push('ipv6.' + Service.Hostname);
	const [key, csr] = await acme.forge.createCsr(CertNames);
	await CA.finalizeOrder(Order, csr);
	const cert = await CA.getCertificate(Order);
	
	// Save Certificate
	console.log("Private Key", Service.Data.TLSKey = key.toString());
	console.log("Certificate", Service.Data.TLSCert = cert.toString());
}

var CurrentCert = false;
module.exports = async function (Service) {
	var CurrentCert = Service.Data.TLSCert;
	var CurrentKey = Service.Data.TLSKey;
	if (CurrentCert && CurrentKey) {
		try {
			CurrentCert = x509.parseCert(CurrentCert);
			var Now = new Date();
			var Expires = new Date(CurrentCert.notAfter);
			var RemainingSeconds = (Expires - Now) / 1000;
			var RemainingHours = RemainingSeconds/(60*60);
			var RemainingDays = RemainingHours/24;
			console.log("Certificate Expires in " + RemainingDays + " days.");
            if (RemainingDays < 30) {
                throw "Renew";
            }
			return Service;
		} catch {}
	}
	console.log("Provisioning a new TLS certificate");
	await Provision(Service);
    return Service;
}

