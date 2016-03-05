
/**
 * controller1.js
 
 Resource Options:
 { 'get':    {method:'GET'},
  'save':   {method:'POST'},
  'query':  {method:'GET', isArray:true},
  'remove': {method:'DELETE'},
  'delete': {method:'DELETE'} };
 
 */
 
 
 
 /*
(function () {
    'use strict';
 
    var app= angular.module('GardenLync');
    app.controller('DispositivosController', ['$scope', function ($scope) {
       
      $scope.todos = [
      { name: 'Master HTML/CSS/Javascript', completed: true },
      { name: 'Learn AngularJS', completed: false },
      { name: 'Build NodeJS backend', completed: false },
      { name: 'Get started with ExpressJS', completed: false },
      { name: 'Setup MongoDB database', completed: false },
      { name: 'Be awesomess!', completed: false },
    ]
       
    }]);
 
}());
*/


(function () {
    'use strict';
 
    var app= angular.module('GardenLync');
    app.controller('ListadoDispositivosCtrl', ['$scope', 'DispositivosService', function($scope,DispositivosService) {
    	
    	//$scope.dispositivo = DispositivosService.get({id:"001"});
    	$scope.dispositivos = DispositivosService.query();
    	$scope.orderProp = 'Id';
    	
    	/*
    	Dispositivos.get({id : "001"},function(data) {
    		$scope.dispositivos = data;
    	}); */
    }]);
    
    app.controller('DetalleDispositivoCtrl', ['$scope', '$routeParams', function($scope,$routeParams) {
    	
    	//$scope.dispositivo = DispositivosService.get({id:"001"});
    	$scope.id  = $routeParams.id;
    	
    	/*
    	Dispositivos.get({id : "001"},function(data) {
    		$scope.dispositivos = data;
    	}); */
    }]);
 
}());
