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
      	//Campo modificado
      	data[path] = valor;
        
         dataProvider.Motor().Save(idMotor, 
    						   data.IdDispositivo,
    						   data.Descripcion,
    						   data.MarcaModelo,
    						   data.Tipo,
    						   data.Pin,
    						   data.EsPinAnalogo,
    						   data.Habilitado,
    						   data.Posicion,
    						   data.Accion,
    						   data.Estado
    						   );
    						   
  		response.json(data);
        
      }
      else
      {
      	response.send("");
      }
    });
	
});

app.get('/api/motores/:id/mediciones', function(request, response){

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





};