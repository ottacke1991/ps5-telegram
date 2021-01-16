var http = require("http");
setInterval(function() {
    http.get("http://scrapper-ps5.herokuapp.com");
}, 300000); // every 5 minutes (300000)
