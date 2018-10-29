angular.module('meanhotel').controller('RegistrationController', RegistrationController);

function RegistrationController(AuthDataFactory){
    var vm = this;

    vm.register = function() {
        vm.erorr = null;
        if(vm.emailAddress && vm.name && vm.password && vm.confirmPassword && vm.contact){
            if(vm.password !== vm.confirmPassword){
                vm.error = "Password doesn't match";
            }else{
                AuthDataFactory.register(vm.emailAddress, vm.password, vm.name, vm.contact)
                .then(function(response){
                    console.log(response);
                    if(response.status === 400){
                        vm.error = response.data.message;
                    }else if (response.status === 200){
                        vm.message = "You have been succfully registered, Please login with your credentials";
                    }
                });
            }
        }
        else{
            vm.error = "All fields are required, Make sure none of them remained unfilled";
        }
    }
}