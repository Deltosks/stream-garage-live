import http from 'node:http';
import {readFile} from 'node:fs/promises';
const files={'/':['index.html','text/html; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8'],'/state.json':['state.json','application/json']};
http.createServer(async(req,res)=>{const file=files[new URL(req.url,'http://localhost').pathname];if(!file){res.writeHead(404);res.end();return;}try{const bytes=await readFile(new URL('../public/'+file[0],import.meta.url));res.writeHead(200,{'Content-Type':file[1],'Cache-Control':'no-store'});res.end(bytes);}catch{res.writeHead(404);res.end();}}).listen(4180,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4180'));
