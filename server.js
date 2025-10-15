console.log("Server is starting...");

const http = require("http");
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World\n");
}).listen(process.env.PORT || 3000);

console.log("Server is listening on port 3000");