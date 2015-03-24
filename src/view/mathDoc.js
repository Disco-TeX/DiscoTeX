(function(){
  var app = angular.module('mathDocument',
                           ['ui.bootstrap',
                            'bibliography-directives',
                            'equation-directive',
                            'proof-directive',
                            'reference-directive',
                            'section-directive',
                            'subsection-directive',
                            'sidebar-directive',
                            'theorem-directive',
                           ]);
  // collapsible element
  app.controller(
    'CollapseCtrl', function ($scope) {
      $scope.isCollapsed = true;
    });

  app.controller("DocumentController", function($scope,$http){
    /*$scope.equations = {};
    $http.get('eqnList.json').then(function(response) {
      $scope.equations = response.data;
    });*/
  });
})();
