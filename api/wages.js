const Converter = require("csvtojson").Converter;
const fs = require("fs");
const _ = require("underscore");
const Work = require("./work.js");
const moment = require("moment");
var jsonData;

var Wages = {
  getDataFromFile: (year, month) => {
    var converter, filePath;
    jsonData = {};
    filePath = "./data/HourList" + year + month + ".csv";

    converter = new Converter({headers: ["name", "person_id", "date", "startTime", "endTime"]});
    return fs.createReadStream(filePath).pipe(converter);
  },

  parseData: (rawData) => {
    _.each(rawData, Wages.addItemToData);
    return jsonData;
  },

  addItemToData: (item) => {
    var personData = jsonData[item.person_id];
    if (!personData) {
      Wages.createNewDataItem(item);
    } else {
      Wages.addToExistingDataItem(personData, item);
    }
  },

  createNewDataItem: (item) => {
    var personData = {
      person_id: item.person_id,
      name: item.name,
      days: {},
      totalWage: 0
    };
    jsonData[item.person_id] = personData;
    Wages.addToExistingDataItem(personData, item);
  },

  addToExistingDataItem: (personData, item) => {
    var workTime = Work.getWorkTimeObject(item);

    if (!personData.days[item.date]) {
      personData.days[item.date] = {
        work: [],
        wage: 0,
        normalDayDiff: -480
      };
    }
    var dayItem = personData.days[item.date];
    var foo = {
      start: workTime.start.format(),
      end: workTime.end.format(),
      wage: Wages.getBasicWage(workTime),
      eveningC: Wages.eveningCompensation(workTime),
      overtimeC: Wages.overtimeCompensation(workTime, dayItem)
    };
    dayItem.work.push(foo);
    dayItem.wage += foo.wage + foo.eveningC + foo.overtimeC;
    dayItem.formattedWage = Math.round(dayItem.wage) / 100;
    personData.totalWage += dayItem.wage
  },

  getBasicWage: (workTime) => {
    const BASIC_SALARY_PER_MINUTE = 375 / 60;
    var duration = workTime.end.diff(workTime.start, "minutes");
    return BASIC_SALARY_PER_MINUTE * duration;
  },

  eveningCompensation: (workTime) => {
    var duration = Work.getEveningCompensationDuration(workTime);
    const EVENING_WORK_COMPENSATION_PER_MINUTE = 115 / 60;
    return EVENING_WORK_COMPENSATION_PER_MINUTE * duration;
  },

  overtimeCompensation: (workTime, day) => {
    var dayDuration = day.normalDayDiff;
    var shiftDuration = workTime.end.diff(workTime.start, "minutes");
    var workDay = Work.getWorkDay(workTime);
    var overtimeCompensation = 0;

    if (dayDuration + shiftDuration > 0) {
      var overTimeDuration = dayDuration + shiftDuration;
      var overtimes = [];

      for (var i=0; i < 3; i++) {
        var overtimeStart = moment(workTime.end).subtract(overTimeDuration, "minutes");

        if (i === 2 || overTimeDuration <= 120) {
          overtimes[i] = overTimeDuration;
          overTimeDuration = 0;
        } else {
          overtimes[i] = 120;
          overTimeDuration -= 120;
        }

        var overtimeEnd = moment(overtimeStart).add(overtimes[i], "minutes");
        var eveningStart = overtimeStart.isSameOrAfter(workDay.evening.start);
        var eveningEnd = overtimeEnd.isAfter(workDay.evening.start);

        var overTimeArr = [];
        if (eveningStart === eveningEnd) {
          overTimeArr.push({
            start: overtimeStart,
            end: overtimeEnd
          });
        } else {
          var eveningStartDiff = overtimeEnd.diff(workDay.evening.start, "minutes");
          var afternoonEnd = moment(overtimeEnd).subtract(eveningStartDiff, "minutes");

          overTimeArr.push(
            { start: overtimeStart, end: afternoonEnd },
            { start: afternoonEnd, end: overtimeEnd }
          );
        }

        var overtimeWage = 0;
        _.each(overTimeArr, (overTimeObj) => {
          overtimeWage += Wages.getBasicWage(overTimeObj);
          if (overTimeObj.start.isSameOrAfter(workDay.evening.start)) {
            overtimeWage += Wages.eveningCompensation(overTimeObj);
          }
        });

        switch (i) {
          case 0: {
            overtimeCompensation += overtimeWage * 0.25;
            break
          }
          case 1: {
            overtimeCompensation += overtimeWage * 0.5;
            break;
          }
          case 2: {
            overtimeCompensation += overtimeWage;
            break;
          }
        }
      }
    }

    day.normalDayDiff += shiftDuration;
    return overtimeCompensation;
  }
};

// public exports
module.exports.parseData = Wages.parseData;
module.exports.getDataFromFile = Wages.getDataFromFile;
module.exports.getBasicWage = Wages.getBasicWage
