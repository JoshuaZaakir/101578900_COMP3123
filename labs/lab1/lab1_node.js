/* 
  We use Node to create a server, listen for incoming requests,
  and then return a response.
*/

var http = require("http");
http
  .createServer((request, response) => {
    response.writeHead(200, {
      "Content-Type": "text/html",
    });
    response.end("The server is now running successfully and listening");
  })
  .listen(8088);

//optional Homework: try another port number
