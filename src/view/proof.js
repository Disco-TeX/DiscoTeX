(function(){
  var app = angular.module('proof-directive',['ui.bootstrap.accordion']);

  app.config(['$provide', Decorate]);

  function Decorate($provide){
    $provide.decorator('accordionGroupDirective', function($delegate){
      var directive = $delegate[0];
      directive.templateUrl = 'templates/proofAccordionOverride.html';

      return $delegate;
    });
  }

  app.directive('dtProof', function(){
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: function(elem, attrs){
        var type = 'Static';
        if (attrs.hasOwnProperty('collapsible')) { type = 'Collapse'};
        return 'templates/proof' + type + '.html';
      },
      scope: {},
      link: function(scope,elem,attrs){
        scope.collapsible = attrs.hasOwnProperty('collapsible');
        if (scope.collapsible) {
          scope.startCollapsed = attrs.hasOwnProperty('startCollapsed');
          scope.isOpen=!scope.startCollapsed;
        }
        scope.useName = false;
        if (attrs.hasOwnProperty('name')) {
          scope.useName = true;
          scope.name = attrs['name'];
        }
      },
    };
  });
})();