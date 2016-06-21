const express = require("express");
const Converter = require("csvtojson").Converter;
const path = require("path");
var app = express();
var jsonData = {};
var port = process.env.PORT || 8080;

console.log(port);
app.set("view engine", "ejs");
app.use(express.static("dist"));

app.get("/", function(req, res) {
  res.render("index");
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

app.listen(port, function () {
  console.log("app is running on http://localhost:" + port);

  var converter = new Converter({headers: ["name", "person_id", "date", "startTime", "endTime"]});
  converter.fromFile("./data/HourList201403.csv", function(err, res) {
    jsonData = res;
  });
});
