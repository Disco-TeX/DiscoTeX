(function(){
  var app = angular.module('section-directive',[]);

  app.directive('dtSection', function(){
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        number: '=',
        sectionTitle: '@',
      },
      templateUrl: 'templates/sectionElement.html',
    };
  });

})();