/*
 * Sensor MongoDB Provider
 * https://github.com/Botanicbot/App/Tweet.js
 * 
 * 2015 Diego Navarro M
 *
 */

var method = DeviceProvider.prototype;

var Models; //require('../../models/Sensor.js');

var _logs;
var _moment;

var DweetIO = require("node-dweetio");
var _dweetClient;

var DWEET = "Dweet";
var MONGO = "Mongo";

var _dweet_prefijo;

var _provider;

function DeviceProvider(logs, moment, config) {
  _logs = logs;
  _moment = moment; // por ahora no utilizado
  if (config.monitor_habilitado == true || config.monitor_habilitado == "true") {
    if (false) {
      _provider = MONGO;
      Models = require('../../models/Bomba.js');  
    }
    else {
      _provider = DWEET;
      this._dweetClient = new DweetIO();
      Models = require("../dto/Dispositivo.js");
      _dweet_prefijo = config.dweetio.prefijo_dispositivo;
    }
  }
  else {
    Models = null;
  }
}


method.Save = function(Id, Nombre, Tipo, Ip,Puerto,Habilitado,Estado) {
    
    if (_provider == MONGO) {
      throw new Error("No implementado");
    }
    if (_provider == DWEET)
    {
      var deviceModel = new Models();
      deviceModel.Crear(Id, Nombre, Tipo, Ip, Puerto, Habilitado,Estado);
      console.log(deviceModel.Objeto());
      console.log(GenerarDweetId(Id));
      
      
      this._dweetClient.dweet_for(GenerarDweetId(Id), deviceModel.Objeto(), function(err, dweet){

          if (err) {console.log("Error al grabar Dispositivo en dweet: " + err);}
         
      }); 
    }

};




method.GetAll = function(callback) {

 if (_provider == MONGO) {

    var myDocs;
     //Models.find({ 'some.value': 5 }, function (err, docs) {
     Models.find({}, function(err, docs) {
       if (err) callback(err)
       else callback(null, docs);
     });
  }

  if (_provider == DWEET) {
    this._dweetClient.get_all_dweets_for(GenerarDweetId(filter.Id), function(err, dweets) {
        
        

        var lstModels = [];

        for(theDweet in dweets)
        {
            var dweet = dweets[theDweet];
            var deviceModel = new Models();
            deviceModel.Crear(dweet.content["Id"], dweet.content["Nombre"], dweet.content["Tipo"], dweet.content["Ip"], dweet.content["Puerto"],dweet.content["Habilitado"], dweet.content["Estado"]);

            lstModels.push(deviceModel.Objeto());
        }
    callback(null, lstModels);
    });
  }
};

method.GetCollection = function(filter, callback) {

 if (_provider == MONGO) {

    Models.find(filter).exec(function(err, docs) {
       if (err) callback(err)
       else callback(null, docs);
     });
  }

  if (_provider == DWEET) {
    this._dweetClient.get_all_dweets_for(GenerarDweetId(filter.Id), function(err, dweets) {

       var lstModels = [];

      for(theDweet in dweets)
      {
          var dweet = dweets[theDweet];

          var deviceModel = new Models();
          deviceModel.Crear(dweet.content["Id"], dweet.content["Nombre"], dweet.content["Tipo"], dweet.content["Ip"], dweet.content["Puerto"],dweet.content["Habilitado"], dweet.content["Estado"]);
          lstModels.push(deviceModel.Objeto());

      }
      callback(null, lstModels);
    });
  }



};

method.GetLast = function(filter, callback) {

  if (_provider == MONGO) {

    throw new Error("No implementado");
  }

  if (_provider == DWEET) {

    this._dweetClient.get_all_dweets_for(GenerarDweetId(filter.Id), function(err, dweets) {

      if (!err){
      var dweet = dweets[0]; // Dweet is always an array of 1
      var deviceModel = new Models();
      deviceModel.Crear(dweet.content["Id"], dweet.content["Nombre"], dweet.content["Tipo"], dweet.content["Ip"], dweet.content["Puerto"],dweet.content["Habilitado"], dweet.content["Estado"]);
      callback(null, deviceModel.Objeto());
      }
    });
  }

};

function GenerarDweetId(id) {
  return _dweet_prefijo + id;

};


module.exports = DeviceProvider;