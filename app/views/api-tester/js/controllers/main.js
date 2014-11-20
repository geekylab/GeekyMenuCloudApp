'use strict';

angular.module('RequestTester')
    .factory('Settings', function ($rootScope, $timeout) {
        return {
            api_host: 'http://localhost:8080'
        }
    })
    .
    controller('MainCtrl', function ($scope) {
        $scope.apis = [
            {
                name: 'store'
            },
            {
                name: 'image'
            }
        ]
    }).controller('StoreCtrl', function ($scope, $http, Settings) {

        $scope.api_host = Settings.api_host;
        $scope.langs = [
            {code: 'us'},
            {code: 'jp'},
            {code: 'br'}
        ];
        $scope.selectedLang = $scope.langs[0];
        $scope.response = '';
        $scope.responseString = '';
        $scope.params = {
            store_id: ''
        };
        $scope.requestUrl = $scope.baseUrl = Settings.api_host + '/open-api/store';
        $scope.baseUrl += '[/:store_id]';

        $scope.$watch('params.store_id', function (n, o) {
            var params = '';
            if (n) {
                params = '/' + n;
            }
            $scope.requestUrl = Settings.api_host + '/open-api/store' + params;
        });

        $scope.filters = {
            location: {
                lng: '-46.374643',
                lat: '-23.969835',
                maxDistance: 1
            }
        };


        $scope.doRequest = function () {
            $http.post($scope.requestUrl, $scope.filters)
                .success(function (json) {
                    $scope.response = json;
                    $scope.responseString = JSON.stringify(json, null, '  ');
                }).error(function (json) {
                    $scope.responseString = JSON.stringify(json, null, '  ');
                });
        };

    }).controller('ImageCtrl', function ($scope, $http, Settings) {

        $scope.response = '';
        $scope.params = {
            image_id: '546e4865f233df30068b5f80'
        };

        $scope.imageSrc = '';

        $scope.requestUrl = $scope.baseUrl = Settings.api_host + '/open-api/image';
        $scope.baseUrl += '[/:image_id]';

        $scope.$watch('params.image_id', function (n, o) {
            var params = '';
            if (n) {
                params = '/' + n;
            }
            $scope.requestUrl = Settings.api_host + '/open-api/image' + params;
        });

        //$scope.filters = {
        //    location: {
        //        lng: '-46.374643',
        //        lat: '-23.969835',
        //        maxDistance: 1
        //    }
        //};


        $scope.doRequest = function () {
            if ($scope.params.image_id) {
                $scope.imageSrc = $scope.requestUrl;
            } else {
                $scope.imageSrc = '';
            }
            //$http.post($scope.requestUrl, $scope.filters)
            //    .success(function (json) {
            //        $scope.response = JSON.stringify(json, null, '  ');
            //    }).error(function (json) {
            //        $scope.response = JSON.stringify(json, null, '  ');
            //    });
        };

    })
;
