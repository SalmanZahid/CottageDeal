angular.module('meanhotel').factory('AuthInterceptor', AuthInterceptor);


function AuthInterceptor(AuthFactory, $window, $q, $location) {

    return {
        request: request,
        response: response,
        responseError: responseError
    }

    function request(config){
        config.headers = config.headers || {};

        if($window.sessionStorage.token){
            config.headers.Authorization = 'Bearer '+ $window.sessionStorage.token;
        }

        return config;
    }

    function response(response){
        if (response.status === 200 && $window.sessionStorage.token && !AuthFactory.isLoggedIn) {
            AuthFactory.isLoggedIn = true;
        } else if (response.status === 401) {
            AuthFactory.isLoggedIn = false;
            delete $window.sessionStorage.token;
        }

        return response || $q.when(response);
    }

    function responseError(rejection){
        if(rejection.status === 401 || rejection.status === 403){
            AuthFactory.isLoggedIn = false;
            delete $window.sessionStorage.token;
            $location.path('/');
        }

        return $q.reject(rejection);
    }
}