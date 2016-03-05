module.exports = function(app, moment, dataProvider, logger) {

/* INICIO API REST */


app.get('/api/relays', function(request, response){
	 dataProvider.Relay().GetAll(function(err, data) { 
      if (data.length > 0) {
        response.json(data);
      }
      else
      {
      	response.json("");
      }
    });
});


app.get('/api/relays/:id', function (request, response) {
    var idRelay = request.params.id;

     var filter = {IdRelay : String};
    filter.IdRelay = idRelay;
    dataProvider.Relay().Find(filter, function(err, data) { 
      if (data) {
        response.send(data);
      }
      else
      {
      	response.send("");
      }
    });
});



app.post('/api/relays',function(request, response) {

    dataProvider.Relay().Save(request.body.IdRelay, 
    						   request.body.IdDispositivo,
    						   request.body.Descripcion,
    						   request.body.MarcaModelo,
    						   request.body.Tipo,
    						   request.body.Pin,
    						   request.body.EsPinAnalogo,
    						   request.body.Habilitado,
    						   request.body.EsInverso
    						   );
    response.json("ok");

	
});

app.put('/api/relays/:id', function(request, response) {
	
	 dataProvider.Relay().Save(request.params.id, 
    						   request.body.IdDispositivo,
    						   request.body.Descripcion,
    						   request.body.MarcaModelo,
    						   request.body.Tipo,
    						   request.body.Pin,
    						   request.body.EsPinAnalogo,
    						   request.body.Habilitado,
    						   request.body.EsInverso
    						   );
    						   
    response.json("ok");
});

app.delete('/api/relays/:id', function(request, response){
	dataProvider.Relay().Delete(request.params.id);
	response.json("ok");
});




};