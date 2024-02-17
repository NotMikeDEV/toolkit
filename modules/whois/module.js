var whoiser = require('whoiser')

module.exports = async (Service)=>{
	Service.StaticPage('/whois/', 'modules/whois/index.html');

	Service.IO.of('/whois/').on('connect', (socket) => {
		socket.on('message', async(Request, Response) => {
			try {
				const Data = await whoiser(Request, {raw:true})
				Response(Data)
			} catch(e) {
				Response({error: e.message})
			}
		});
	});
};