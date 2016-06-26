const express = require("express");
const path = require("path");
var app = express();
var port = process.env.PORT || 3000;
var wages = require("./api/wages.js");

app.use(express.static("dist"));

app.get("/", function(req, res) {
  res.render(path.join(__dirname + "/dist/index.html"));
});

app.get("/api", function (req, res) {
  res.send("API");
});

app.get("/api/year/:year/month/:month", function (req, res) {
  var readStream = wages.getDataFromFile(req.params.year, req.params.month);
  readStream.on("end_parsed", (rawData) => {
    res.send(wages.parseData(rawData));
  });
});

app.listen(port, function () {
  console.log("app is running on http://localhost:" + port);
});
