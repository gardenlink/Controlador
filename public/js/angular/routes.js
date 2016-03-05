
(function () {
    'use strict';
 
    var app= angular.module('GardenLync');
    
    app.config(function($routeProvider) {
    $routeProvider
	    .when('/Dispositivos', {templateUrl: 'partials/listado-dispositivos.html', controller: 'ListadoDispositivosCtrl'})
	    .when('/Dispositivos/:id', {templateUrl: 'partials/detalle-dispositivo.html', controller: 'DetalleDispositivoCtrl'})
	    //.when('/login', {templateUrl: 'login.html', controller: 'LoginCtrl'})
	    // AngularJS does not allow template-less controllers, so we are specifying a
	    // template that we know we won't use. Here is more info on this
	    // https://github.com/angular/angular.js/issues/1838
	    //.when('/logout', {templateUrl: 'login.html', controller: 'LogoutCtrl'})
	    .otherwise({redirectTo: '/Dispositivos'}); 
	});
 
}());