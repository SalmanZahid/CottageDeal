angular.module('meanhotel').factory('hotelDataFactory', HotelDataFactory);

function HotelDataFactory($http){
    return {
        getHotels: get,
        getHotelById: getById,
        addReview: postReview,
        getReviews: getHotelReviews
    };

    function get(){
       return $http.get('/api/hotels?count=10').then(complete).catch(failed);
    }

    function getById(id){
        return $http.get('/api/hotels/' + id).then(complete).catch(failed);
    }

    function postReview(hotelId, reviews){
        return $http.post('/api/hotels/' + hotelId + '/reviews', reviews).then(complete).catch(failed);
    }

    function getHotelReviews(hotelId){
        return $http.get('/api/hotels/' + hotelId + '/reviews').then(complete).catch(failed);
    }

    function complete(response){
        return response;
    }

    function failed(error){
       console.log(error.statusText);
    }
};

