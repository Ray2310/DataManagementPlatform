const http = require('http')
const path = require('path')
const url = require('url')
const fs = require('fs')
const date = new Date()
const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
const day = String(currentDate.getDate()).padStart(2, '0');
const hours = String(currentDate.getHours()).padStart(2, '0');
const minutes = String(currentDate.getMinutes()).padStart(2, '0');
const seconds = String(currentDate.getSeconds()).padStart(2, '0');
const currentDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
// const { error } = require('console')
//获取资源的页面目录 page/ 里面有login/ 、content/ 、 publish/ 等
const root = 'F:/hmSource/DataManagement/DataManagementPlatform/' 
//拼接资源目录
// const filepath = path.join(root, 'login/index.html') 
const server = http.createServer(function (request,response){
    //获取url的path路径 类似'/css/bootstrap.css'
    let pathname = url.parse(request.url).pathname;
     // 获得对应的本地文件路径，类似 '/srv/www/css/bootstrap.css':
    let filepath = path.join(root, pathname);
    //判断文件状态
    fs.stat(filepath, function(error, stats){
        if(!error && stats.isFile()){
            //文件存在并且没有出错 打印日志
            console.log('DateTime: '+currentDate + ' \t status: 200\t' + 'path: '+ request.url )
            response.writeHead(200)
            //TODO: 将文件流向response
            fs.createReadStream(filepath).pipe(response)
        }else{
            //如果出现报错 - 打印日志
            console.log('DateTime: '+currentDate + ' status: 404' + 'path: '+ request.url )
            response.writeHead(404)
            response.end('404 not found')   
        }
    })
})
//也可以将ip设置为本地ip
server.address('192.168.1.105')
server.listen('8080')
console.log('Server is running at http://192.168.1.105:8080/');