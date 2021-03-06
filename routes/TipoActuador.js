module.exports = function(app, dataProvider, logger) {

/* INICIO API REST */

/**
 * @api {get} /api/tipoactuadores Obtiene la lista de actuadores
 * @apiName tipoactuadores
 * @apiGroup TipoActuador
 */
app.get('/api/tipoactuadores', function(request, response){
	 dataProvider.TipoActuador().GetAll(function(err, data) { 
      if (data.length > 0) {
        response.json(data);
      }
      else
      {
      	response.json("");
      }
    });
	 
});

/**
 * @api {get} /api/tipoactuadores/:id Obtiene el tipo de actuador
 * @apiName tipoactuadores
 * @apiGroup TipoActuador
 *
 * @apiParam {Number} id TipoActuador unique ID.
 *
 */
app.get('/api/tipoactuadores/:id', function (request, response) {
     var idTipoActuador = request.params.id;

     var filter = {};
    filter.IdTipoActuador = idTipoActuador;
    dataProvider.TipoActuador().Find(filter, function(err, data) { 
      if (data) {
        response.json(data);
      }
      else
      {
      	response.json("");
      }
    });
});



};