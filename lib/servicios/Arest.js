var method = Arest.prototype;
var req = require('restler');
var _address;
var _DEBUG = true;
var _MOCK = true;  //Para solo emular las respuestas de arduino en modo local

function Arest(address) 
{
   this._address = address;
}


  method.pinModeOutput = function(pin,callback) {
    var url = 'http://' + this._address + '/mode/' + pin + '/o';
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    }).on('error', function(error, response) { 
    	console.log("Arest -> Error: " + error);
    	callback(error, null);
    });
  };

   method.pinModeInput = function(pin,callback) {
    var url = 'http://' + this._address + '/mode/' + pin + '/i';
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    }).on('error', function(error, response) { 
    	console.log("Arest -> Error: " + error);
    	callback(error, null);
    });
  };


  method.digitalWrite = function(pin, state, callback) {
    var url = 'http://' + this._address + '/digital/' + pin + '/' + state;
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    }).on('error', function(error, response) { 
    	console.log("Arest -> Error: " + error);
    	callback(error, null);
    });
  };

  method.analogWrite = function(pin, state,callback) {
    var url = 'http://' + this._address + '/analog/' + pin + '/' + state;
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    }).on('error', function(error, response) { 
    	console.log("Arest -> Error: " + error);
    	callback(error, null);
    });
  };

  method.analogRead = function(pin, callback) {
    var url = 'http://' + this._address + '/analog/' + pin;
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data, response) {
    	callback(null, data.return_value);
    	return;
    }).on('error', function(error, response) { 
    	console.log("Arest -> Error: " + error);
    	callback(error, null);
    });
  };

  method.digitalRead = function(pin, callback) {  		
    var url = 'http://' + this._address + '/digital/' + pin;
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(null, data.return_value);
    return;
    }).on('error', function(error, response) { 
    	console.log("Arest -> Error: " + error);
    	callback(error, null);
    });
  };

  method.getVariable = function(variable, callback) {
    var url = 'http://' + this._address + '/' + variable;
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    }).on('error', function(error, response) { 
    	console.log("Arest -> Error: " + error);
    	callback(error, null);
    });
  };

  method.callFunction = function(called_function, parameters, callback) {
    var url = 'http://' + this._address + '/' + called_function + '?params=' + parameters;
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
    		callback(null, data.return_value);
    		return;
    	}
    }).on('error', function(error, response) { 
    	console.log("Arest -> Error: " + error);
    	callback(error, null);
    });
  };

  method.boardInfo = function(id, callback) {
     var url = 'http://' + this._address + '/' + id;
     if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    }).on('error', function(error, response) { 
    	console.log("Arest -> Error: " + error);
    	callback(error, null);
    });
  }


module.exports = Arest;