var app = angular.module('meanhotel', ['ngRoute']).config(config);

function config($routeProvider,$locationProvider, $httpProvider) {
    $locationProvider.hashPrefix('');
    $httpProvider.interceptors.push('AuthInterceptor');
    $routeProvider
        .when('/', {
            templateUrl: 'angular-app/main/templates/main.html'
        })
        .when('/register', {
            templateUrl: 'angular-app/auth/registration/registration.html',
            controller: RegistrationController,
            controllerAs: 'vm',
        })
        .when('/hotels', {
            templateUrl: 'angular-app/hotels/templates/hotels.html',
            controller: HotelsController,
            controllerAs: 'vm',
            operation: 'list',
            access: {
                restricted: true
            }
        })
        .when('/hotel/:id', {
            templateUrl: 'angular-app/hotels/templates/hotel.html',
            controller: HotelsController,
            controllerAs: 'vm',
            operation: 'detail'
        }).otherwise({
            redirectTo: '/'
        });
}

app.run(function($rootScope, $window, $location, AuthFactory) {
    $rootScope.$on('$routeChangeStart',function(event, nextRoute, currentRoute) {
        if (nextRoute.access !== undefined && nextRoute.access.restricted && !$window.sessionStorage.token && !AuthFactory.isLoggedIn){
            event.preventDefault();
            $location.path('/');
        }else if($window.sessionStorage.token) {
            AuthFactory.auth.isLoggedIn = true;
            $rootScope.operation = nextRoute.$$route.operation;
        }
    });
})