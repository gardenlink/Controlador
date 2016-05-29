module.exports = function(app, moment, dataProvider, serviceProvider, logger) {


var _ = require('underscore');

var Medicion = require("../lib/dto/Medicion.js");
var objMedicion = new Medicion();

/* INICIO API REST */

var TipoDispositivo = "MOTOR";


app.get('/api/motores', function(request, response){
	 dataProvider.Motor().GetAll(function(err, data) { 
      if (data.length > 0) {
        response.json(data);
      }
      else
      {
      	response.json("");
      }
    });
});


app.get('/api/motores/:id', function (request, response) {
    var idMotor = request.params.id;

     var filter = {IdMotor : String};
    filter.IdMotor = idMotor;
    dataProvider.Motor().Find(filter, function(err, data) { 
      if (data) {
        response.send(data);
      }
      else
      {
      	response.send("");
      }
    });
});



app.post('/api/motores',function(request, response) {

    dataProvider.Motor().Save(request.body.IdMotor, 
    						   request.body.IdDispositivo,
    						   request.body.Descripcion,
    						   request.body.MarcaModelo,
    						   request.body.Tipo,
    						   request.body.Pin,
    						   request.body.EsPinAnalogo,
    						   request.body.Habilitado,
    						   request.body.Posicion,
    						   request.body.Accion,
    						   request.body.Estado
    						   );
    						   
    response.json("ok");

	
});

app.put('/api/motores/:id', function(request, response) {
	
	 dataProvider.Motor().Save(request.params.id, 
    						   request.body.IdDispositivo,
    						   request.body.Descripcion,
    						   request.body.MarcaModelo,
    						   request.body.Tipo,
    						   request.body.Pin,
    						   request.body.EsPinAnalogo,
    						   request.body.Habilitado,
    						   request.body.Posicion,
    						   request.body.Accion,
    						   request.body.Estado
    						   );
    						   
    response.json("ok");
});

app.delete('/api/motores/:id', function(request, response){
	dataProvider.Motor().Delete(request.params.id);
	response.json("ok");
});

app.patch('/api/motores/:id', function(request, response) {
	var idMotor = request.params.id;
    var op = request.body.op; //solamente replace por ahora 
    var path = request.body.path; //debe venir sin comillas
    var valor = request.body.value;
    

	var filter = {IdMotor : String};
    filter.IdMotor = idMotor;
    dataProvider.Motor().Find(filter, function(err, data) { 
      if (data) {
      	
      	
      	//Si el cambio es para manipular el estado del motor, llamo al servicio de Arduino
      	if (path == "Accion") {
      		//var activo = helper.toBoolean(valor);
      		
      		
      			console.log("PATCH: /api/motores/id --> path : " + path + " valor de parametro : " + valor);
      			
      			
      			serviceProvider.Motor().ReporteMotor(data.IdDispositivo, data.IdMotor, function(error, data) {
      			
      			  	if (error)
		            {
		                logger.error("MonitorSalud.Motor(): Error al verificar Motor, detalle: " + error);
		                console.log("MonitorSalud.Motor(): Error al verificar Motor, detalle: " + error);
		                response.json(error);
		            }
		            else
		            {
		            
		            switch (valor)
	      			{
	      				case "Avanzar":
	      					serviceProvider.Motor().Avanzar(data.IdDispositivo, data.IdMotor, function(error, data) {});
	      					break;
	      				
	      				case "Retroceder":
	      					serviceProvider.Motor().Retroceder(data.IdDispositivo, data.IdMotor, function(error, data) {});
	      					break;
	      				
	      				case "Detener":
	      					serviceProvider.Motor().Detener(data.IdDispositivo, data.IdMotor, function(error, data) {});
	      					break;
	      				case "Estado":
	      					serviceProvider.Motor().Estado(data.IdDispositivo, data.IdMotor, function(error, data) {});
	      					break;
	      				
	      				case "Posicion":
	      					serviceProvider.Motor().Posicion(data.IdDispositivo, data.IdMotor, function(error, data) {});
	      					break;
	      			}
		            
		              //TODO: agregar atributo IdTipoActuador en dto Sensor
		              
		              //Campo modificado
      				  data[path] = valor;
      	
      	
		              dataProvider.Motor().Save( 
		              		data.IdMotor
						  , data.IdDispositivo
						  , data.Descripcion
						  , data.MarcaModelo
						  , data.Tipo
						  , data.Pin
						  , data.EsPinAnalogo
						  , data.Habilitado
						  , data.Posicion
						  , data.Accion
						  , data.Estado); //TODO: Revisar por que puede ir undefined
						  
					  dataProvider.Medicion().Save(
					  	3,
					  	data.IdMotor, 
					  	data.IdDispositivo,
					  	data.Posicion
					  );
		              
		            }
		            
		            response.json(data);

      			});
        
      }
      else
      {
      	response.send("");
      }
    }
    });
	
});


// Llamada para obtener el ultimo registro
// http://localhost:9000/api/motores/1/mediciones?last=true&sorttype=_id&sortdirection=desc
// criteria can be asc, desc, ascending, descending, 1, or -1

app.get('/api/motores/:id/mediciones', function(request, response){

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








};