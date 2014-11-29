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
                name: 'category'
            },
            {
                name: 'item'
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

            console.log($scope.requestUrl);

            $http.post($scope.requestUrl, $scope.filters)
                .success(function (json) {
                    $scope.response = json;
                    $scope.responseString = JSON.stringify(json, null, '  ');
                }).error(function (json) {
                    $scope.responseString = JSON.stringify(json, null, '  ');
                });
        };

    }).controller('CategoryCtrl', function ($scope, $http, Settings) {

        $scope.api_host = Settings.api_host;
        
        $scope.langs = [
            {code: 'us'},
            {code: 'jp'},
            {code: 'br'}
        ];
        


        $scope.response = '';
        $scope.responseString = '';
        $scope.params = {
            store_id: '547881eddc760d1200f02b7e',
            lang: $scope.langs[0]
        };

        $scope.requestUrl = $scope.baseUrl = Settings.api_host + '/open-api/category';
        $scope.baseUrl += '/:store_id[?l=:lang]';

        $scope.$watch('params', function (n, o) {
            var params_store = '';

            if (n.store_id) {
                params_store = '/' + n.store_id + '?l=' + n.lang.code;
            }
            $scope.requestUrl = Settings.api_host + '/open-api/category' + params_store;
        }, true);

        $scope.filters = {};

        $scope.doRequest = function () {
            console.log("doRequest",$scope.requestUrl);
            $http.post($scope.requestUrl, $scope.filters)
                .success(function (json) {
                    $scope.response = json;
                    $scope.responseString = JSON.stringify(json, null, '  ');
                }).error(function (json) {
                    $scope.responseString = JSON.stringify(json, null, '  ');
                });
        };

    }).controller('ItemCtrl', function ($scope, $http, Settings) {

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
            store_id: '547881eddc760d1200f02b7e',
            item_id: ''
        };
        $scope.requestUrl = $scope.baseUrl = Settings.api_host + '/open-api/item';
        $scope.baseUrl += '/:store_id[/:store_id]';

        $scope.$watch('params', function (n, o) {
            var params_item = '';
            var params_store = '';

            if (n.store_id) {
                params_store = '/' + n.store_id;
            }

            if (n.item_id) {
                if (!params_store) {
                    params_item = '//' + n.item_id;
                } else {
                    params_item = '/' + n.item_id;
                }
            }
            $scope.requestUrl = Settings.api_host + '/open-api/item' + params_store + params_item;
        }, true);

        $scope.filters = {
            category_id : '5478c935f29d4d51026a0fac'
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
