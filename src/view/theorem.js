(function(){
  var app = angular.module('theorem-directive',[]);

  // still a bad solution but good enough for now
  app.factory('theoremTypes',function(){
    var types = {
      "theorem": "Theorem",
      "definition": "Definition",
      "corollary": "Corollary",
      "lemma": "Lemma",
    };
    return types;
  });

  app.directive('dtTheoremlike', ['theoremTypes', function(theoremTypes){
    return {
      restrict: 'E',
      scope: {
        number: '=',
        name: '@',
        type: '@class',
      },
      transclude: true,
      templateUrl: 'templates/thmElement.html',
      link: function(scope,elem,attrs){
        scope.typeDict = theoremTypes;
        scope.useName = attrs.hasOwnProperty('name');
      },
    };
  }]);
})();