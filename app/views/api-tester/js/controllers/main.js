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
            }
        ]
    }).controller('StoreCtrl', function ($scope, $http, Settings) {

        $scope.response = '';
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
                    $scope.response = JSON.stringify(json, null, '  ');
                }).error(function (json) {
                    $scope.response = JSON.stringify(json, null, '  ');
                });
        };

    })
;
