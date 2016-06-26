const express = require("express");
const helmet = require("helmet");
const path = require("path");
var app = express();
var port = process.env.PORT || 3000;
var wages = require("./api/wages.js");

app.use(helmet());
app.disable('x-powered-by');
app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.render(path.join(__dirname + "/dist/index.html"));
});

app.get("/api", (req, res) => {
  res.send("API");
});

app.get("/api/year/:year/month/:month", (req, res) => {
  var readStream = wages.getDataFromFile(req.params.year, req.params.month);
  readStream.on("end_parsed", (rawData) => {
    res.send(wages.parseData(rawData));
  });
});


app.listen(port, () => {
  console.log("app is running on http://localhost:" + port);
});
