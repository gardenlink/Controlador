var method = Arest.prototype;
var req = require('restler');
var _address;
var _DEBUG = true;

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
    });
  };

   method.pinModeInput = function(pin,callback) {
    var url = 'http://' + this._address + '/mode/' + pin + '/i';
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    });
  };


  method.digitalWrite = function(pin, state, callback) {
    var url = 'http://' + this._address + '/digital/' + pin + '/' + state;
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    });
  };

  method.analogWrite = function(pin, state,callback) {
    var url = 'http://' + this._address + '/analog/' + pin + '/' + state;
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    });
  };

  method.analogRead = function(pin, callback) {
    var url = 'http://' + this._address + '/analog/' + pin;
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(null, data.return_value);
    return;
    });
  };

  method.digitalRead = function(pin, callback) {  		
    var url = 'http://' + this._address + '/digital/' + pin;
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(null, data.return_value);
    return;
    });
  };

  method.getVariable = function(variable, callback) {
    var url = 'http://' + this._address + '/' + variable;
    if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
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
    });

  };

  method.boardInfo = function(id, callback) {
     var url = 'http://' + this._address + '/' + id;
     if (_DEBUG)
    	console.log(url);
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    });
  }


module.exports = Arest;