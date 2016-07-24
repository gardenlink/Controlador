module.exports = function(app, moment, dataProvider, serviceProvider, logger) {

var Medicion = require("../lib/dto/Medicion.js");
var objMedicion = new Medicion();

var TipoDispositivo = "SENSOR";

var req = require('restler');
var async = require('async');
var _ = require('underscore');


var sensorService = serviceProvider.Sensor();

/* INICIO API REST */


app.get('/api/sensores', function(request, response){
	 dataProvider.Sensor().GetAll(function(err, data) { 
      if (data.length > 0) {
        response.json(data);
      }
      else
      {
      	response.json("");
      }
    });
});


app.get('/api/sensores/:id', function (request, response) {
    var idSensor = request.params.id;

     var filter = {IdSensor : String};
    filter.IdSensor = idSensor;
    dataProvider.Sensor().Find(filter, function(err, data) { 
      if (err) {
      	response.send(err);
      }
      else if (data) {
      
        response.send(data);
      }
      else
      {
      	response.send("");
      }
    });
});



app.post('/api/sensores',function(request, response) {

    dataProvider.Sensor().Save(request.body.IdSensor, 
    						   request.body.IdDispositivo,
    						   request.body.Descripcion,
    						   request.body.MarcaModelo,
    						   request.body.Tipo,
    						   request.body.Pin,
    						   request.body.EsPinAnalogo,
    						   request.body.Habilitado
    						   );
    response.json("ok");

	
});

app.put('/api/sensores/:id', function(request, response) {
	
	 dataProvider.Sensor().Save(request.params.id, 
    						   request.body.IdDispositivo,
    						   request.body.Descripcion,
    						   request.body.MarcaModelo,
    						   request.body.Tipo,
    						   request.body.Pin,
    						   request.body.EsPinAnalogo,
    						   request.body.Habilitado
    						   );
    						   
    response.json("ok");
});

app.delete('/api/sensores/:id', function(request, response){
	dataProvider.Sensor().Delete(request.params.id);
	response.json("ok");
});


// Llamada para obtener el ultimo registro
// http://localhost:9000/api/sensores/1/mediciones?last=true&sorttype=_id&sortdirection=desc
// criteria can be asc, desc, ascending, descending, 1, or -1

app.get('/api/sensores/:id/mediciones', function(request, response){

	var  today = moment();
    yesterday = moment(today).add(-12, 'hours');
    
    var returnLast = false;
    var sortObject= null;
    
    if (request.query.last == true || request.query.last == "true"){
    	console.log("LAST");
     	returnLast = request.query.last;
     	
     	sortObject = {};
		var stype = request.query.sorttype;
		var sdir = request.query.sortdirection;
		sortObject[stype] = sdir;
    }
    
	 var filter = {
	 			   IdTipoActuador : Number,
	 			   IdActuador : Number
	 			  };
	 			  
	 
	 filter.IdTipoActuador = objMedicion.GetTipoActuadorByName(TipoDispositivo);
	 filter.IdActuador = request.params.id;
	 
	 
	 if (returnLast)
	 {
	 	filter.sortObject = sortObject ? sortObject : null;
	 	
	 	dataProvider.Medicion().GetLast(filter, function(err, data) { 
	      if (err){
	      	response.json(err);
	      }
	      else
	      {
	      	console.log(data);
		    response.json(data);
		  }
     	});
	 }
	 else
	 {
	 	dataProvider.Medicion().GetCollection(filter, function(err, data) { 
	      if (err){
	      	response.json(err);
	      }
	      else
	      {
		    response.json(data);
		  }
     	});
	 }
	 
	 
	 
     
});



app.get('/api/sensores/:id/mediciones/:id', function(request, response){
	var params = request.params.id;
	var p = request.query;
	console.log(params);
	console.log(p);
});


app.post('/api/sensores/mediciones',function(request, response) {

    dataProvider.Medicion().Save(objMedicion.GetTipoActuadorByName(TipoDispositivo), 
    						   request.body.IdSensor,
    						   request.body.IdDispositivo,
    						   request.body.Valor
    						   );
    response.json("ok");

});




app.get('/api/v1/servicio/sensores/:id', function(request, response, next){
		var id = request.params.id;
			
		dataProvider.Cache(true, function(error, data ) {
			var result = _.find(data.Sensores, function (item) {
				return item.IdSensor == id;
			});
			if (result) {
				
				
				serviceProvider.Sensor().Leer(result.IdDispositivo, result.IdSensor, result.Tipo, function (error, doc) {
	      				if (error) {
	      					console.log("[GET] /api/v1/servicio/sensores/:id -> Error all lamar a servicio Arduino para Sensores -> error :  ", error);
	      					return;
	      				}
	      				else {
							return response.json(doc);
	            		}
	      			}); 
				
				/*
				//Obtengo detalle de sensor
				var url = "http://localhost:9000/api/sensores/" + result.IdSensor + "/mediciones?last=true&sorttype=TimeStamp&sortdirection=desc"
				req.get(url).on('complete', function(data) {
			    	result.UltimaMedicion = data;
					response.json(result);    	
			    }).on('error', function(error, response) { 
			    	console.log("Servicio -> Error: " + error);
			    	response.json(error);
			    });
			    */
			}
			else
			{
				response.json("");
			}
			
		});
});

app.get('/api/v1/servicio/sensores/:id/mediciones/grafico', function(request, response, next) {

	var  today = moment();
    yesterday = moment(today).add(-12, 'hours');

   var filter =  {TimeStamp: {
      $gte: yesterday.toDate(),
      $lt: today.toDate()},
      Id : request.params.id
    };

    //TODO: Implementar filtros en cache

});






};