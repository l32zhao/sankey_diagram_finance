import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('./', import.meta.url);
const files = {'/':'index.html','/app.js':'app.js','/style.css':'style.css','/model.js':'model.js'};
const types = {html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8'};
http.createServer(async (req,res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) {res.writeHead(404);res.end('Not found');return;}
  try {const data=await readFile(new URL(file,root));res.writeHead(200,{'Content-Type':types[file.split('.').pop()]});res.end(data);} catch {res.writeHead(500);res.end('Unable to read file');}
}).listen(Number(process.env.PORT)||3000, process.env.HOST||'127.0.0.1',()=>console.log('Finance app listening on port '+(process.env.PORT||3000)));
