(function(){
  var app = angular.module('subsection-directive',[]);

  app.directive('dtSubsection', function(){
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        number: '=',
        sectionTitle: '@',
      },
      templateUrl: 'templates/subsectionElement.html',
    };
  });

})();
