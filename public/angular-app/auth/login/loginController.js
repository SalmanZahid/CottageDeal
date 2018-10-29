angular.module('meanhotel').controller("LoginController", loginController);

function loginController(AuthFactory, AuthDataFactory, $location, $window){
    vm = this;

    vm.isLoggedIn = function() {
        return AuthFactory.auth.isLoggedIn;
    }

    vm.Login = function() {
        if(vm.username && vm.password){
            AuthDataFactory.login(vm.username, vm.password)
                            .then(response => {
                                if(response.status == 200){
                                    var token = response.data;
                                    $window.sessionStorage.token = token,
                                    AuthFactory.auth.isLoggedIn = true,
                                    $location.path('/'),
                                    vm.username = '',
                                    vm.password = '';
                                }
                });
        }
    }

    vm.Logout= function(){
        delete $window.sessionStorage.token;
        AuthFactory.auth.isLoggedIn = false;
        $location.path('/');
    }

    vm.isActiveTab = function(url) {
        $('.navbar-nav li').removeClass('active');
        var currentPath = $location.path().split('/')[1];
        return url === currentPath ? 'active' : '';
    }
}