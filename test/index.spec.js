import Wages from "../api/wages";
import Work from "../api/work";
import { getDataItem } from "./test-helpers";
import { assert } from "chai";

describe("Wages", () => {
  it("basic salary for workhours should equal expected", () => {
    var item = getDataItem();
    var workTime = Work.getWorkTimeObject(item);
    var result = Wages.getBasicWage(workTime);
    const expectation = 1500;
    assert.equal(result, expectation);
  });
});
