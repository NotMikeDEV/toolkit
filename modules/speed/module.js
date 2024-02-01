const RandomBytes = require("pseudo-random-buffer")()
const IPAddr = require('ip6addr');
const crypto = require('crypto');
const util = require('util');

module.exports = async (Service)=>{
	Service.StaticPage('/speed/', 'modules/speed/index.html');

	Service.ExpressRouter.get('/speed/.down', (req,res)=>{
		res.setHeader("Content-Type", "application/data");
		res.noCompress = true;
        let Ended = false
		req.on('abort', ()=>{
            Ended = true
            res.end()
		});
		const FillBuffer = ()=>{
            var Buff
            do {
                Buff = RandomBytes(1024*1024)
            } while (!Ended && res.write(Buff));
		}
		res.socket.on('drain', ()=>{
            if (!Ended)
    			FillBuffer();
		});
		FillBuffer();
        setTimeout(()=>{
            Ended = true
            res.end()
        }, 20000)
	});
	Service.ExpressRouter.put('/speed/.up', (req,res)=>{
		req.on('abort', ()=>{
            res.end()
		});
        res.end()
    })
}