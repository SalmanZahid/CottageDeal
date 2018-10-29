angular.module('meanhotel').factory('UserFactory', UserFactory);

function UserFactory($http){
    return {
        login: login,
        register:register
    };

    function login( username, password ) {
        var data = {
            username: username,
            password: password
        };

        return $http.post('/api/login', data).then(complete).catch(failed);
    }

    function register(emailAddress, password, name, contact){
        var data = {
            emailAddress: emailAddress,
            password: password,
            name: name,
            contact: contact
        };
        
        return $http.post('/api/signup', data).then(complete).catch(failed);
    }

    function complete(response) {
        return response;
    }

    function failed(error){
        return error;
    }
}