/*
Purpose: This is the main entry point into our
Node.js server

We will set up server paths to the following:

/
/users
/userlist
/name
*/

let http = require("http")
let fs = require("fs")
let users = require("./data") // namespace

const PORT = 8088

var server = http.createServer((request, response) => {
    if(request.url == "/"){
        response.write("<h1>Node.js server at the root path</h1>")
        response.write("<p>You can go to the other paths to view their server writes as well: Try /name, /users, or /userlist</p>")
        response.end()
    }
    if(request.url == "/name"){
        response.writeHead(200, {"Content-Type": "text/html"})
        response.write("<article> Joshua Zaakir </article>")
        response.end()
    }
    if(request.url == "/users"){
        // Convert JSON object from data.js -> JSON string right here in main.js
        let data = JSON.stringify(users.users.id) // We need to use the dot operator
        // to get the property (ie. exported variable users) from the namespace users
        response.write(data)
        response.end()
    }
    if(request.url == "/userlist"){
        fs.readFile(__dirname + "/employees.json", "utf8", (error, data) => {
            response.write(data)
            response.end()
        })
    }
})

server.listen(PORT)
console.log("The server started at this port" + PORT)