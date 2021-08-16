const fs = require('fs').promises

module.exports = async (Service)=>{
    try {
        await fs.rmdir("captures", {recursive: true})
    } catch (e) {}
    await fs.mkdir("captures", {recursive: true})

    await Service.StaticPage('/pcap/', 'modules/pcap/index.html');
    await Service.StaticFile('/pcap/cshark', 'modules/pcap/cshark.sh');
    
    const UploadHandler = async(req, res)=>{
        const URL = req.url.split('/')
        console.log(URL)
        const Filename = URL[URL.length - 2] + "_" + (new Date()).getTime() + ".pcap"
        const F = await fs.open("captures/" + Filename, "w")
        var size = 0
        req.on('data', (data)=>{
            F.write(data)
            size += data.length
        })
        req.on('end', ()=>{
            F.close()
            console.log("PCAP upload", Filename)
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            res.end(JSON.stringify({filename: Filename, id: Filename, size: size}))
            setTimeout(()=>{
                fs.rm("captures/" + Filename)
            }, 1000*60*60)
        })
    }
    Service.ExpressRouter.all('/pcap/api/v1/*/upload', UploadHandler)
    Service.ExpressRouter.all('/pcap/*/upload', UploadHandler)
    Service.ExpressRouter.get('/pcap/captures/*', async(req, res)=>{
        const URL = req.url.split('/')
        const Filename = URL[3]
        try {
            const F = await fs.readFile("captures/" + Filename)
            res.writeHead(200, {'Content-Type': 'application/pcap', 'Content-Disposition': 'attachment; filename="' + Filename + '"'});
            res.end(F)
        } catch (e) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end("<html><body><h1>404 Not Found</h1></body></html>")
        }
    })
}