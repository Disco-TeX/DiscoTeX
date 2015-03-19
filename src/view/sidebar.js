(function(){
  var app = angular.module('sidebar-directive',[]);

  app.directive('dtSidebar', function(){
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/sidebarElement.html',
      link: function(scope,element,attrs){
        /* Extract the number-title pairs.
           The for loop is unfortunately mildly necessary,
           HTMLcollections do not allow you to map over them easily.
        */
        var numberTitles = function(sections){
          ntArray = [];
          for (var i=0; i<sections.length; i++) {
            ntArray.push({number: sections[i].getAttribute('number'),
                          title: sections[i].getAttribute('section-title')});
          }
          return ntArray;
        }
        scope.sections = numberTitles(document.getElementsByTagName('dt-section'));
      },
    }
  });
})();