var whois = require('whois')

module.exports = async (Service)=>{
	Service.StaticPage('/whois/', 'modules/whois/index.html');

	Service.IO.of('/whois/').on('connect', (socket) => {
		socket.on('message', async(Request, Response) => {
			whois.lookup(Request, function(err, data) {
				console.log(data)
				Response(data)
			})
		});
	});
};