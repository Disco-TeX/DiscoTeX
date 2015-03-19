(function(){
  var app = angular.module('equation-directive',[]);

  // service for recording equations,
  // used by the reference elements
  app.factory('equationDatabase', function(){
    var service = {
      equationDict: {},
      addEqn: function(label,eqnTag,eqnBody){
        service.equationDict[label] = {body: eqnBody, tag: eqnTag};
      }
    };
    return service;
  });

  app.directive('dtEquation', ['equationDatabase', function(equationDatabase){
    return {
      restrict: 'E',
      scope: {
        label: '@',
        tag: '@',
      },
      transclude: true,
      //templateUrl: 'templates/eqnElement.html',
      link: function(scope, elem, attrs, controller, transcludeFn) {
        transcludeFn(scope,function(clone){
          scope.body = clone.text().trim();
          var content = '';
          if (attrs.hasOwnProperty('label')) {
            equationDatabase.addEqn(scope.label,
                                    scope.tag,
                                    scope.body);
            content += '\\label{'+scope.label+'}\n';
          }
          content += scope.body+'\n';
          if (attrs.hasOwnProperty('tag')) {
            content += '\\tag{\\('+scope.tag+'\\)}';
          }
          elem.html('<script type="math/tex; mode=display">'+
                    content+
                    '</script>');
        });
      },
    };
  }]);
})();