var express = require("express");
var Converter = require("csvtojson").Converter;
var path = require("path");
var app = express();
var jsonData = {};

app.use(express.static("public"));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/dist/index.html"));
});

app.get("/api", function (req, res) {
  res.send(jsonData);
});

app.get("/api/person/:id", function (req, res) {
  var id = req.params.id;
  res.send(jsonData.filter(function(row) {
    return parseInt(row.person_id, 10) === parseInt(id, 10);
  }));
});

app.listen(3000, function () {
  var converter = new Converter({headers: ["name", "person_id", "date", "startTime", "endTime"]});
  converter.fromFile("./data/HourList201403.csv", function(err, res) {
    jsonData = res;
  });

  console.log("app running: localhost:3000");
});
