const http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    mime = require("mime");

const eventTracker = fs.readFileSync(path.join(__dirname, 'eventTracker.js'), 'utf8');
const PORT = 8000;

let analytics; // store user analytics data
initializeDataStore();


// spinning the http server
const server = http.createServer(function(request, response) {
  let requestBody = '';
  let json;

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(),'src', uri);

  fs.access(filename, function(err) {
    if(err) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

	  if (fs.statSync(filename).isDirectory()) filename += '/index.html';
    console.log(filename);
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      if(filename.endsWith('.html')) {
        file = `${file.toString()}\n\n<script>${eventTracker}</script>`
      }
      response.writeHead(200, {"Content-Type": mime.getType(filename)});
      response.write(file, "binary");
      response.end();
    });
  });

  if (request.method == 'POST' && url.parse(request.url).pathname == '/analytics' ) {
    request.on('data', function(data) {
      // console.log(data);
      requestBody += data;
    })

    request.on("end", () => {
      try {
          json = JSON.parse((requestBody));
          // console.dir(json);
          saveData(json);
      } catch (error) {
          console.error(error.message);
      };
  });
    // console.log("Data Received");
    // console.dir(json);
  }
});

server.listen(PORT, function(err) {
  if(err) {
    console.log("Server couldn't be started!!")
  }
  console.log("Static file server running at\n  => http://localhost:"+ PORT + "/\nCTRL + C to shutdown");
});




const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

function initializeDataStore() {
  if (fs.existsSync("analytics.json")){
    let analytics = fs.readFileSync("analytics.json","utf-8");
  } else {
    fs.writeFileSync('analytics.json', JSON.stringify({"sessionData": []}))
  }
}

function saveData(data) {
  let analytics = fs.readFileSync("analytics.json","utf-8");
  analyticsData = JSON.parse(analytics);
  analyticsData.sessionData.push(data);
  fs.writeFileSync('analytics.json', JSON.stringify(analyticsData, null, 2));
}

// export default server;
module.exports = server;