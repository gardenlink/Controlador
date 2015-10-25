var method = Arest.prototype;
var req = require('restler');
var _address;

function Arest(address) 
{
   this._address = address;
}


  method.pinModeOutput = function(pin,callback) {
    var url = 'http://' + this._address + '/mode/' + pin + '/o';
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    });
  };

   method.pinModeInput = function(pin,callback) {
    var url = 'http://' + this._address + '/mode/' + pin + '/i';
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    });
  };


  method.digitalWrite = function(pin, state, callback) {
    var url = 'http://' + this._address + '/digital/' + pin + '/' + state;
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    });
  };

  method.analogWrite = function(pin, state,callback) {
    var url = 'http://' + this._address + '/analog/' + pin + '/' + state;
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    });
  };

  method.analogRead = function(pin, callback) {
    var url = 'http://' + this._address + '/analog/' + pin;
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    });
  };

  method.digitalRead = function(pin, callback) {
    var url = 'http://' + this._address + '/digital/' + pin;
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    });
  };

  method.getVariable = function(variable, callback) {
    var url = 'http://' + this._address + '/' + variable;
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    });
  };

  method.callFunction = function(called_function, parameters, callback) {
    var url = 'http://' + this._address + '/' + called_function + '?params=' + parameters;
    req.get(url).on('complete', function(data) {
    if (callback != null) {callback(data);}
    return;
    });

  };

  method.boardInfo = function(id, callback) {
     var url = 'http://' + this._address + '/' + id;
    req.get(url).on('complete', function(data) {
    callback(data);
    return;
    });
  }


module.exports = Arest;