/*
 * Sensor MongoDB Provider
 * https://github.com/Botanicbot/App/Tweet.js
 * 
 * 2015 Diego Navarro M
 *
 */

var method = SensorProvider.prototype;

var Models; //require('../../models/Sensor.js');

var _logs;
var _moment;

var DweetIO = require("node-dweetio");
var _dweetClient;

var DWEET = "Dweet";
var MONGO = "Mongo";

var _dweet_prefijo;

var _provider;

function SensorProvider(logs, moment, config) {
  _logs = logs;
  _moment = moment; // por ahora no utilizado
  if (config.monitor_habilitado == true || config.monitor_habilitado == "true") {
    if (false) {
      _provider = MONGO;
      Models = require('../../models/Sensor.js');  
    }
    else {
      _provider = DWEET;
      this._dweetClient = new DweetIO();
      Models = require("../dto/Sensor.js");
      _dweet_prefijo = config.dweetio.prefijo_sensor;
    }
  }
  else {
    Models = null;
  }
}


method.Save = function(sensor, valor) {
    
    if (_provider == MONGO) {
      var medicion = new Models({
          TipoMedicion: sensor
        , Valor: valor
        , TimeStamp : Date.now()
        });

        medicion.save(function(err, medicion) {
          if (err) { _logs.error("SensorProvider: Error al grabar en base de datos. Detalle: +" + err); return console.error(err); }
          //console.dir(medicion);
        });
    }
    else
    {
      var medicion = new Models();
      medicion.Crear(sensor, sensor, Date.now(), valor);
      
      
      this._dweetClient.dweet_for(GenerarDweetId(sensor), medicion.Objeto(), function(err, dweet){

          if (err) {console.log(err);}
         
          //console.log(dweet.thing); // "my-thing"
          //console.log(dweet.content); // The content of the dweet
          //console.log(dweet.created); // The create date of the dweet
        


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
            var medicion = new Models();
            medicion.Crear(dweet.content["Id"], dweet.content["Pin"], dweet.content["TimeStamp"], dweet.content["Valor"]);
            lstModels.push(medicion.Objeto());
            //console.log(dweet.thing); // The generated name
            //console.log(dweet.content); // The content of the dweet
            //console.log(dweet.created); // The create date of the dweet
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

          var medicion = new Models();
            medicion.Crear(dweet.content["Id"], dweet.content["Pin"], dweet.content["TimeStamp"], dweet.content["Valor"]);
            lstModels.push(medicion.Objeto());

          console.log(dweet.thing); // The generated name
          console.log(dweet.content); // The content of the dweet
          console.log(dweet.created); // The create date of the dweet
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

      var dweet = dweets[0]; // Dweet is always an array of 1
      var medicion = new Models();
      medicion.Crear(dweet.content["Id"], dweet.content["Pin"], dweet.content["TimeStamp"], dweet.content["Valor"]);
      callback(null, medicion);
    });
  }

};

function GenerarDweetId(sensor) {
  return _dweet_prefijo + sensor;

};


module.exports = SensorProvider;