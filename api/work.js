const moment = require("moment");

var Work = {
  getEveningCompensationDuration: (workTime) => {
    var eveningWorkDuration = 0;
    const EVENING_WORK_COMPENSATION_MAX = 720; // max 12 hours from 6PM to 6AM

    var workDay = Work.getWorkDay(workTime);
    if (workTime.start.isBefore(workDay.normal.start)) {
      eveningWorkDuration = Work.getMorningShiftDuration(workDay, workTime);
    } else if (workTime.end.isAfter(workDay.normal.end)) {
      eveningWorkDuration = Work.getEveningShiftWork(workDay, workTime);
    }
    return eveningWorkDuration < EVENING_WORK_COMPENSATION_MAX ? eveningWorkDuration : EVENING_WORK_COMPENSATION_MAX;
  },

  getMorningShiftDuration: (workDay, workTime) => {
    var duration = 0;
    if (workTime.end.isAfter(workDay.normal.start)) {
      duration = workDay.morning.end.diff(workTime.start, "minutes");
    } else {
      duration = workTime.end.diff(workTime.start, "minutes");
    }
    return duration;
  },

  getEveningShiftWork: (workDay, workTime) => {
    var duration = 0;
    if (workTime.end.isAfter(workDay.evening.start)) {
      if (workTime.start.isAfter(workDay.evening.start)) {
        duration = workTime.end.diff(workTime.start, "minutes");
      } else {
        duration = workTime.end.diff(workDay.evening.start, "minutes");
      }
    }
    return duration;
  },

  getWorkDay: (workTime) => {
    var workDay = {};
    workDay["normal"] = {
      start: moment(workTime.start).hours(6).minutes(0),
      end: moment(workTime.start).hours(18).minutes(0)
    };
    workDay["evening"] = {
      start: moment(workDay.normal.end),
      end: moment(workDay.normal.start).add(1, "days")
    };
    workDay["morning"] = {
      start: moment(workTime.start).hours(0).minutes(0),
      end: moment(workDay.normal.start)
    };
    return workDay;
  },


  getMomentObject: (date, time) => {
    const dateTimeFormat = "DD.MM.YYYY HH:mm";
    return moment([date, time].join(" "), dateTimeFormat);
  },

  getWorkTimeObject: (item) => {
    var workTime = {
      start: Work.getMomentObject(item.date, item.startTime),
      end: Work.getMomentObject(item.date, item.endTime),
    };

    if (workTime.start.isSameOrAfter(workTime.end)) {
      workTime.end.add(1, "day");
    }

    return workTime;
  }
};

module.exports.getWorkTimeObject = Work.getWorkTimeObject;
module.exports.getEveningCompensationDuration = Work.getEveningCompensationDuration;
module.exports.getWorkDay = Work.getWorkDay;
