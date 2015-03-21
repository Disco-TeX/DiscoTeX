(function(){
  var app = angular.module('reference-directive', ['equation-directive']);

  app.controller('RefCtrl',
                 ['$scope', 'equationDatabase',
                  function($scope,equationDatabase){
                    $scope.equations = equationDatabase.equationDict;
                  }]);

  app.directive('dtReference', function(){
    return {
      restrict: 'E',
      scope: {
        label: '@',
      },
      template: ('<dt-reference-helper equations="equations" label="{{label}}">'
                 + '</dt-reference-helper>'),
    }
  });

  app.directive('dtEqref', function(){
    return {
      restrict: 'E',
      scope: {
        label: '@',
      },
      template: ('<dt-reference-helper equations="equations" label="{{label}}">'
                 + '</dt-reference-helper>'),
    }
  });

  // This helper exists solely so that users don't have to put
  // 'equations="equations"' on every reference tag they write.
  app.directive('dtReferenceHelper', function(){
    return {
      restrict: 'E',
      scope: {
        label: '@',
        equations: '=',
      },
      templateUrl: 'templates/refElement.html',
      controller: 'RefCtrl',
      link: function(scope, elem, attrs, controller){
        scope.$watch('equations', function(){
          scope.tag = scope.equations[scope.label].tag;
          scope.body = scope.equations[scope.label].body;
        });
      },
    }
  });
})();