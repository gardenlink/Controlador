var method = PonteMqttClient.prototype;
var async = require("async");
var _address;
var _opt;
var _usuario = "demo";
var _DEBUG = false;
var _MOCK = false;  //Para solo emular las respuestas de arduino en modo local
var client;


function PonteMqttClient(address, port, usuario, opt) 
{
   
   if (port)
   		this._address = address + ":" + port;
   else
   		this._address = address;	
   		
   if (usuario)
   	this._usuario = usuario;	
   
   if (opt) {
	   this._opt = opt; //no usado por ahora
	   
	   if (this._opt.Debug) 
	   	_DEBUG = this._opt.Debug;
	   	
	   if (this._opt && this._opt.Mock)
	   	_MOCK = this._opt.Mock;
   }
   
}

 method.Tipo = function() {
 	return "MQTT";
 };




method.Iniciar = function(tarjetas, actuadores) {
	console.log(this._usuario);
	async.each(actuadores, function(result, callb) {
		console.dir(result);
		if (result.Habilitado) {
			var topic = "/" + _usuario + "/" + "D" + result.IdDispositivo + "/R" + result.IdRelay +  "sub";
			console.log(topic);
		}
	},
	function(error) { if (error) { 
			  		console.log("RelayService.LlamarServicio.LecturaAsyncRelays : error : " + error);
			  		return callback(error, null);
			  		}	
			  	 });
	/*
	var mqtt    = require('mqtt');
   	var client  = mqtt.connect('mqtt://' + this._address + ':' + this._port);
	
	client.on('connect', function () {
		  client.subscribe('/demo/D001/status');
		  console.log('connected');
		 
		client.on('message', function (topic, message) {
		  console.log(message.toString());
		  client.end();
		  });
		  
		
	});
	*/
	
};


function ObtenerValor(usuario, topic) { 
	
}; 

  
  method.Publicar = function(topic, payload, callback) {
    var url = 'http://' + this._address + '/resources/' + this._usuario + '/' + topic;
    if (_DEBUG)
    	console.log(url);
    req.post(url, {
    	//data: { id: 334 }
    	data : { payload }
    }).on('complete', function(data) {
    	if (data instanceof Error) {
    		if (_DEBUG)
    			console.log("Error al llamar funcion en arduino, Error : " + data);
    		return callback(data, null);
    	}
    	else
    	{
    		return callback(null, data);
    		
    	}
    }).on('error', function(error, response) { 
    	console.log("PonteHttpClient -> Error: " + error);
    	return callback(error, null);
    });
  };
  
  method.Leer = function(topic, callback) {
    var url = 'http://' + this._address + '/resources/' + this._usuario + '/' + topic;
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    	if (data instanceof Error) {
    		if (_DEBUG)
    			console.log("Error al llamar funcion en arduino, Error : " + data);
    		return callback(data, null);
    	}
    	else
    	{
    		return callback(null, data);
    	}
    }).on('error', function(error, response) { 
    	console.log("PonteHttpClient -> Error: " + error);
    	return callback(error, null);
    });
  };
  

module.exports = PonteMqttClient;