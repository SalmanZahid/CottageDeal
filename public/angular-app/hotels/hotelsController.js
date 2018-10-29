angular.module('meanhotel').controller('HotelsController', HotelsController);

function HotelsController ($rootScope, $routeParams, hotelDataFactory){
    var vm = this;
    vm.reviewForm = {
        name: null,
        rating: null,
        review: null
    };

    init = function() {
        switch($rootScope.operation){
            case 'list': 
                getHotels();
                break;
            case 'detail':
                getHotelById();
                break;
            default:
                getHotels();
                break;
        }
    }
    
    init();

    function getHotels(){
        hotelDataFactory.getHotels().then(function(response){
            vm.hotels = response.data;
        });
    }

    function getHotelById(){
        var hotelId = $routeParams.id;
        hotelDataFactory.getHotelById(hotelId).then(function(response){
            vm.hotel = response.data;
            vm.stars = createArray(response.data.stars);
        });
    }

    function getHotelReviews(){
        var hotelId = $routeParams.id;
        hotelDataFactory.getReviews(hotelId).then(function(response){
            vm.hotel.reviews = response.data;
        });
    }

    function createArray(length){
        return new Array(length);
    }

    /* VIEW MODEL METHODS REGION */
    vm.addReview = function() {
        var hotelId = $routeParams.id;
        hotelDataFactory.addReview(hotelId, vm.reviewForm).then(function(){
            getHotelReviews();
            angular.copy({}, vm.reviewForm);
        });
    }
}