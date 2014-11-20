angular
    .module('RequestTester', ['ngRoute'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            }).when('/store', {
                templateUrl: 'views/store.html',
                controller: 'StoreCtrl'
            }).when('/image', {
                templateUrl: 'views/image.html',
                controller: 'ImageCtrl'
            });
    });