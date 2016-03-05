module.exports = function(app, moment, dataProvider, logger) {

/* INICIO API REST */


app.get('/api/temporizadores', function(request, response){
	 dataProvider.Temporizador().GetAll(function(err, data) { 
      if (data.length > 0) {
        response.json(data);
      }
      else
      {
      	response.json("");
      }
    });
});


app.get('/api/temporizadores/:id', function (request, response) {
    var idTemporizador = request.params.id;

     var filter = {};
    filter.IdTemporizador = idTemporizador;
    dataProvider.Temporizador().Find(filter, function(err, data) { 
      if (data) {
        response.send(data);
      }
      else
      {
      	response.send("");
      }
    });
});



app.post('/api/temporizadores',function(request, response) {


    dataProvider.Temporizador().Save(request.body.IdTemporizador, 
	    						   request.body.IdDispositivo,
	    						   request.body.IdTipoActuador,
	    						   request.body.IdActuador,
	    						   request.body.Descripcion,
	    						   request.body.DuracionMinutos,
	    						   request.body.NumeroDias,
	    						   request.body.HorasActivacion,
	    						   request.body.Habilitado
    						   );
    response.json("ok");

	
});

app.put('/api/temporizadores/:id', function(request, response) {
	
	 dataProvider.Temporizador().Save(request.params.id, 
    						   request.body.IdDispositivo,
    						   request.body.IdTipoActuador,
    						   request.body.IdActuador,
    						   request.body.Descripcion,
    						   request.body.DuracionMinutos,
    						   request.body.NumeroDias,
    						   request.body.HorasActivacion,
    						   request.body.Habilitado
    						   );
    						   
    response.json("ok");
});

app.delete('/api/temporizadores/:id', function(request, response){
	dataProvider.Temporizador().Delete(request.params.id);
	response.json("ok");
});




};