import angular from "angular";
import WageAppController from "./controllers/WageAppController.js";
import wagesTemplate from "./templates/wages.html";

var app = angular.module("wageApp", [require("angular-route")]);
app.factory("WagesData", ($http) => {
  return $http.get("/api/year/2014/month/03");
});
app.controller("WageAppController", WageAppController);

app.config(($routeProvider) => {
  $routeProvider
    .when("/", {
      template: wagesTemplate
    })
    .otherwise({
      redirectTo: "/"
    });
});

app.filter("wageFilter", () => {
  return (wage) => {
    return Math.round(wage) / 100 + " " + String.fromCharCode(0x20AC);
  }
});

