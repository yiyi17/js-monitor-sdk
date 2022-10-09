const http = require('http');
// const fs = require('fs');

const sleep = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

http
  .createServer(async (req, res) => {
    console.log(req);
    res.writeHead(200, { 'contenty-type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    await sleep(4000);
    // fs.appendFile('./1.txt', '124\n', {}, () => {});
    res.end('hello wrold');
  })
  .listen(8080);
