// angular.module('meanhotel').directive('hotelRating', hotelRating);

// function hotelRating(){
//     return {
//         restrict: 'E',
//         scope: {
//             stars: '@'
//         },
//         bindToController: true,
//         controller: 'HotelsController',
//         controllerAs: 'vm',
//         template: '<span ng-repeat="star in vm.stars track by $index" class="glyphicon glyphicon-star">{{ star }}</span>'
//     };
// }

angular.module('meanhotel').component('hotelRating', {
    bindings: {
      stars: '@'
    },
    template: '<span ng-repeat="star in vm.stars track by $index" class="glyphicon glyphicon-star">{{ star }}</span>',
    controller: 'HotelsController',
    controllerAs: 'vm'
  });