'use strict';

var digApp = angular.module('digApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'btford.socket-io',
    'ui.router',
    'ui.bootstrap',
    'elasticui'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/list');

    $locationProvider.html5Mode(true);
});

angular.element(document).ready(function() {
    var $http = angular.injector(['ng']).get('$http');

    $http.get('/config')
    .success(function(config) {
        var euiHost = (config.euiHost || 'localhost') + ':' + (config.euiPort || 9200);
        digApp.constant('euiHost', euiHost);

        var euiSearchIndex = (config.euiSearchIndex || 'dig');
        digApp.constant('euiSearchIndex', euiSearchIndex);

        var simHost = (config.simHost || 'localhost') + ':' + (config.simPort || 3001);
        digApp.constant('simHost', simHost);

        angular.bootstrap(document, ['digApp']);
    })
    .error(function() {
        digApp.constant('euiHost', 'http://localhost:9200');
        digApp.constant('euiSearchIndex', 'dig');
        digApp.constant('simHost', 'http://localhost:3001');
    });
});
