(function(){
  var app = angular.module('bibliography-directives',[]);

  // service for recording the bibitem contents,
  // used by the citation elements
  app.factory('bibItemDatabase', function($http){
    var bibPromise = null;
    return function(){
      // check if already requested
      if (bibPromise) {
        return bibPromise;
      } else {
        bibPromise = $http.get('json/bibItems.json');
        return bibPromise;
      }
    };
  });

  app.controller('BibliographyCtrl',
      ['$scope','bibItemDatabase',
       function($scope,bibItemDatabase){
         $scope.bd = {};
         bibItemDatabase().then(function(response){
           $scope.bd = response.data;
         });
       }]);

  app.directive('dtBibliography', function(){
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'templates/bibliographyElement.html',
    };
  });

  app.directive('dtBibitem', function(){
    return {
      restrict: 'E',
      scope: {
        label: '@',
      },
      template: '<li id="{{ label }}" ng-controller="BibliographyCtrl"><dt-bibitemhelper label="{{ label }}" bd="bd"></dt-bibitemhelper></li>',
    };
  });

  app.directive('dtBibitemhelper', function(){
    return {
      restrict: 'E',
      scope: {
        label: '@',
        bd: '=',
      },
      template: '<span ng-include="templateUrl">Bib content not yet loaded.</span>',
      link: function(scope,elem,attr){
        scope.$watch('bd', function(){
          scope.item = scope.bd[scope.label];
          if (scope.item !== undefined) {
            var url = 'templates/bib-templates/'+scope.item.type+'.html';
            scope.templateUrl = url;
          }
        });
      },
    };
  });

  app.directive('dtCite', function(){
    return {
      restrict: 'E',
      scope: {
        label: '@',
      },
      template: '<dt-cite-helper label="{{label}}" bd="bd" ng-controller="BibliographyCtrl"></dt-cite-helper>',
    };
  });

  app.directive('dtCiteHelper', function(){
    return {
      restrict: 'E',
      scope: {
        label: '@',
        bd: '=',
      },
      templateUrl: 'templates/citeElement.html',
      link: function(scope,elem,attr){
        scope.active = false;
        scope.show = function(){ scope.active = true; };
        scope.hide = function(){ scope.active = false;};
      },
    };
  });

})();