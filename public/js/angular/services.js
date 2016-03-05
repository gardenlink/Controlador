(function () {
    'use strict';
 
    var app= angular.module('GardenLync');
    app.factory('Dispositivos', 
     function($resource){
	    var res = $resource('/api/dispositivos/:id', { id: '@id' } /* ,{
    		query: {
    			method : 'GET',
    			params : { id: '@id' },
    			isArray : false,
    			transformResponse : function(data, headers) {
    				
    			
    			  var jsonData = angular.fromJson(data); //or angular.fromJson(data)
		          var Disp = [];
				
		          angular.forEach(jsonData, function(item){
		            var disp = new Disp();
		            disp.Nombre = item.Nombre;  
		            Disp.push(disp);
		          });
		        
		        	return data[0];
      			  //return Disp;
      			  
    			}
    			
    		}
	    } */
	    );
	    return res;
	 }
 );
}());



/*

angular.module('GardenLync.services', []).factory('Dispositivos', function($resource) {
  return $resource('http://localhost:9000/api/dispositivos/:id', { id: '@_id' }, {
    update: {
      method: 'PUT'
    }
  });
});

*/


/*
(function () {
    'use strict';
 
    var app= angular.module('GardenLync');
    app.factory('Dispositivos', 
     function(){
      return [
        { name: 'AngularJS Directives', completed: true },
        { name: 'Data binding', completed: true },
        { name: '$scope', completed: true },
        { name: 'Controllers and Modules', completed: true },
        { name: 'Templates and routes', completed: true },
        { name: 'Filters and Services', completed: false },
        { name: 'Get started with Node/ExpressJS', completed: false },
        { name: 'Setup MongoDB database', completed: false },
        { name: 'Be awesome!', completed: false },
      ];
    });
 
}());

*/