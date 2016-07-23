var method = PonteHttpClient.prototype;
var req = require('restler');
var _address;
var _opt;
var _usuario = "demo";
var _DEBUG = false;
var _MOCK = false;  //Para solo emular las respuestas de arduino en modo local


function PonteHttpClient(address, port, usuario, opt) 
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
 	return "HTTP";
 };

  
  method.Publicar = function(topic, payload, callback) {
    var url = 'http://' + this._address + '/resources/' + this._usuario + '/' + topic + '/server';
    if (_DEBUG) 
    	console.log("PonteHttpClient.Publicar: -> URL : " + url + " -> PAYLOAD : " + payload); 
    
    req.post(url, {
    	//data: { id: 334 }
    	data : { payload }
    }).on('complete', function(data) {
    	if (data instanceof Error) {
    		if (_DEBUG)
    			console.log("PonteHttpClient.Publicar : Error al llamar funcion en arduino, Error : " + data);
    			
    		return callback(data, null);
    	}
    	else
    	{
    		req.get(url).on('complete', function(ret) {
    			if (ret instanceof Error) {
    				if (_DEBUG)
    					console.log("PonteHttpClient.Publicar : Error al verificar el dato, Error : " + ret);
    				  return callback(ret, null);
				}
				else
				{
					if (_DEBUG)
						console.log("PonteHttpClient.Publicar -> Respuesta : " + ret);
	    			return callback(null, ret);
    			}
    		});
    		
    	}
    }).on('error', function(error, response) { 
    	console.log("PonteHttpClient -> Error: " + error);
    	return callback(error, null);
    });
  };
  
  method.Leer = function(topic, callback) {
    var url = 'http://' + this._address + '/resources/' + this._usuario + '/' + topic + '/client';
    if (_DEBUG)
    	console.log("PonteHttpClient.Leer: -> URL : " + url);
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
  

module.exports = PonteHttpClient;