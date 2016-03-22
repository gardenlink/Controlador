module.exports = function(app, moment, dataProvider, logger){

var ArestLibrary = require("../lib/servicios/Arest.js");
var NetworkingLibrary = require("../lib/util/Net.js");
var arduinoService; 



/* REST API */

/**
 * @api {get} /api/dispositivos/:id Obtener informacion de un dispositivo determinado
 *
 * @apiParam {id} id Dispositivo (unico)
 *
 * @apiSuccess {json} El objeto solicitado.
 */
app.get('/api/dispositivos/:id', function (request, response) {
    var dispositivo = request.params.id;

     var filter = {Id : String};
    filter.Id = dispositivo;
    dataProvider.Device().Find(filter, function(err, data) { 
      if (data) {
        response.send(data);
      }
      else
      {
      	response.send("");
      }
    });
});


/**
 * @api {get} /api/dispositivos Obtiene el listado de dispositivos
 *
 * @apiSuccess {array} El arreglo de objetos solicitado
 */
app.get('/api/dispositivos', function(request, response){
	 dataProvider.Device().GetAll(function(err, data) { 
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
 * @api {post} /api/dispositivos Crea un dispositivo
 * @apiSuccess {json} ok
 */
app.post('/api/dispositivos',function(request, response) {

	var id = request.body.Id;
    var nombre = request.body.Nombre;
    var tipo = request.body.Tipo;
    var ip = request.body.Ip;
    var puerto = request.body.Puerto;
    var habilitado = request.body.Habilitado;
    var estado = request.body.Estado;
    var ip = request.body.Ip;
    var frecuencia = request.body.FrecuenciaMuestreo;

    dataProvider.Device().Save(id, nombre, tipo, ip,puerto,habilitado,estado,frecuencia);
    
    response.json("ok");

	
});

/**
 * @api {put} /api/dispositivos/:id Modifica un dispositivo
 * @apiSuccess {json} ok
 */
app.put('/api/dispositivos/:id', function(request, response) {

   	var id = request.params.id;
    var nombre = request.body.Nombre;
    var tipo = request.body.Tipo;
    var ip = request.body.Ip;
    var puerto = request.body.Puerto;
    var habilitado = request.body.Habilitado;
    var estado = request.body.Estado;
    var ip = request.body.Ip;
    var frecuencia = request.body.FrecuenciaMuestreo;

    dataProvider.Device().Save(id, nombre, tipo, ip,puerto,habilitado,estado,frecuencia);
    
    response.json("ok");
	
});

/**
 * @api {delete} /api/dispositivos/:id Elimina un dispositivo
 * @apiSuccess {json} ok
 */
app.delete('/api/dispositivos/:id', function(request, response){
	dataProvider.Device().Delete(request.params.id);
	response.json("ok");
});

/**
 * @api {put} /api/dispositivos/:id/ip Modifica la property ip
 * @apiSuccess {json} ok
 */
app.put('/api/dispositivos/:id/ip', function(request, response) {
	var id = request.params.id;
    var ip = request.body.ip;
    var estado = true;
    
	var filter = {Id : String};
    filter.Id = id;
    
    dataProvider.Device().Find(filter, function(err, data) { 
      if (err){
      	console.log("/api/dispositivos/:id/ip --> Error: " + err);
      	throw new Error(err);
      }
      
      if (data) {
      	console.log("Llega peticion -> valor: " + data.FrecuenciaMuestreo);
        dataProvider.Device().Save(data.Id, data.Nombre, data.Tipo, ip,data.Puerto,data.Habilitado,estado, data.FrecuenciaMuestreo);
        response.json(data.FrecuenciaMuestreo);
      }
      else{
        response.json("-1");
      }
    });
});



app.put('/Dispositivo/SubscribirDispositivo/:id', function (request, response) {
    var id = request.params.id;
    var key = request.body.key;
    var ip = request.body.ip;
    console.log("Llega peticion de subscripcion desde dispositivo: " + id + " con IP : " + ip);
    console.log("Obteniendo informacion del dispositivo..");

    //this.arduinoService = new ArestLibrary(ip + ':' + "9000");
    //this.arduinoService.boardInfo(id,  function(data) { console.log(data); });

    //sensorProvider.Save(sensor, valor);
    var filter = {Id : String};
    filter.Id = id;
    

    dataProvider.Device().Find(filter, function(err, data) { 
      if (data.length > 0) {
        dataProvider.Device().Save(data[0].Id, data[0].Nombre, data[0].Tipo, ip,data[0].Puerto,data[0].Habilitado,true);
        response.json(data);
      }
      else{
        response.json("");
      }
    });
    
});

app.put('/Dispositivo/NotificarEstado/:id', function (request, response) {
    var id = request.params.id;
    var key = request.body.key;
    var ip = request.body.ip;
    console.log("Llega notificacion de estado de dispositivo: " + id + " con IP : " + ip);
    

    //this.arduinoService = new ArestLibrary(ip + ':' + "9000");
    //this.arduinoService.boardInfo(id,  function(data) { console.log(data); });

    //sensorProvider.Save(sensor, valor);
    var filter = {Id : String};
    filter.Id = id;
    
    dataProvider.Device().Find(filter, function(err, data) { 
      if (data.length > 0) {
        dataProvider.Device().Save(data[0].Id, data[0].Nombre, data[0].Tipo, ip,data[0].Puerto,data[0].Habilitado,true);
      }
    });
    
    //dataProvider.Device().GetAll(function(err, data) {
     // console.log(data);
     // });
    
    response.json("Ok");  
});

app.get('/Dispositivo/ConsultarEstado/:id', function (request, response) {
    var dispositivo = request.params.id;

    var filter = {Id : String};
    filter.Id = dispositivo;
    //var valor = request.body.valor;
    console.log("llega consulta de estado para dispositivo " + dispositivo);
    dataProvider.Device().Find(filter, function(err, data) { 
      if (data.length > 0) {
        console.log(data);

        response.json(data[0].FrecuenciaMuestreo);
      }
      else
      {
        response.json("No existen dispositivos");
      }
    });
});

app.get('/api/dispositivos/:id/ping', function(request, response) {

	 var dispositivo = request.params.id;

     var filter = {Id : String};
    filter.Id = dispositivo;
    dataProvider.Device().Find(filter, function(err, data) { 
      if (data) {
        var net = new NetworkingLibrary();
			net.Ping(data.Ip, function(error, datos) {
				if (error) {
					response.send("");
				}
				else
				{
					response.send(datos);
				}
		});
      }
      else
      {
      	response.send("");
      }
    });
	

	
});




};