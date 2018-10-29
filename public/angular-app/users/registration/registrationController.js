angular.module('meanhotel').controller('RegistrationController', RegistrationController);

function RegistrationController(UserFactory) {
    var vm = this;

    vm.register = function () {
        vm.erorr = null;
        if (vm.username && vm.name && vm.password && vm.confirmPassword) {
            if (vm.password !== vm.confirmPassword) {
                console.log("doesn't match");
                vm.error = "Password doesn't match";

            } else {
                UserFactory.register(vm.username, vm.password, vm.name)
                    .then(function (response) {
                        if (response.status === 400) {
                            vm.error = response.data.message;
                        } else if (response.status === 200) {
                            vm.message = "You have been succfully registered, Please login with your credentials";
                        }
                    });
            }
        } else {
            vm.error = "All fields are required, Make sure none of them remained unfilled";
        }
    }
}