export default class WageAppController {
  constructor($scope, WagesData) {
    WagesData.success(function (data) {
      $scope.wages = data;
    });

    this.showDetailed = (item) => {
      $scope.detailed = item;
    };

    this.clearDetailed = () => {
      $scope.detailed = null;
    };
    
    this.stopEvent = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
  }
}
