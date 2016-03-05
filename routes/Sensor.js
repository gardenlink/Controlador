module.exports = function(app, moment, dataProvider, serviceProvider, logger) {

var Medicion = require("../lib/dto/Medicion.js");
var objMedicion = new Medicion();


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
      if (data) {
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


app.get('/api/sensores/:id/mediciones', function(request, response){

	 var filter = {
	 			   IdTipoActuador : Number,
	 			   IdActuador : Number
	 			  };
	 			  
	 
	 filter.IdTipoActuador = objMedicion.GetTipoActuadorByName(TipoDispositivo);
	 filter.IdActuador = request.params.id;
	 
	 dataProvider.Medicion().GetCollection(filter, function(err, data) { 
	      if (err){
	      	response.json(err);
	      }
	      else
	      {
		      if (data.length > 0) {
		        response.json(data);
		      }
		  }
     });
     
});



app.post('/api/sensores/mediciones',function(request, response) {

    dataProvider.Medicion().Save(objMedicion.GetTipoActuadorByName(TipoDispositivo), 
    						   request.body.IdSensor,
    						   request.body.IdDispositivo,
    						   request.body.Valor
    						   );
    response.json("ok");

});

app.get('/api/sensores/:id/temperatura', function(request, response) {
	
	 var idSensor = request.params.id;
	 var respuesta;

     var filter = {IdSensor : String};
     filter.IdSensor = idSensor;
     dataProvider.Sensor().Find(filter, function(err, data) { 
	      if (data) {
	        sensorService.GetTemperatura(data.IdDispositivo, data.IdSensor, function(error, res) {
	        	if (error) {
	        		console.dir("error: /api/sensores/:id/temperatura -> detalle : " + error);
	        	} else
	        	{
		        	console.log(res);
		        	response.json(res);
	        	}
	        });
	      }
	      else
	      {
	      	response.send("");
	      }
     });
	
});

app.get('/api/sensores/:id/lectura', function(request, response) {
	
	 var idSensor = request.params.id;
	 var respuesta;

     var filter = {IdSensor : String};
     filter.IdSensor = idSensor;
     dataProvider.Sensor().Find(filter, function(err, data) { 
	      if (data) {
	        sensorService.LeerSensor(data.IdDispositivo, data.IdSensor, function(error, res) {
	        	response.json(res);
	        });
	      }
	      else
	      {
	      	response.send("");
	      }
     });
     
     
	
});





};