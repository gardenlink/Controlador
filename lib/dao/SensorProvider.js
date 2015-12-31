/*
 * Sensor MongoDB Provider
 * https://github.com/Botanicbot/App/Tweet.js
 * 
 * 2015 Diego Navarro M
 *
 */

var method = SensorProvider.prototype;

var Models; //require('../../models/Sensor.js');
var MongoModels;

var _logs;
var _moment;

var DweetIO = require("node-dweetio");
var _dweetClient;

var _DEBUG = false;

var DWEET = "Dweet";
var MONGO = "Mongo";

var async = require('async');

var _dweet_prefijo;

var Datastore = require('nedb'); 
var db = {};


var _provider = {
  DWEET : false,
  MONGO : false,
  NEDB :false
};



function SensorProvider(logs, moment, config) {
  console.log("Inicializando SensorProvider..");
  _logs = logs;
  
    if (config.MONGO.Habilitado == "true") {
      _provider.MONGO = true;
        Models = require("../dto/Sensor.js");

      var mongoose = config.MONGO.DataSource, Schema = mongoose.Schema;

      var SensorSchema = new Schema({
          Id : Number
          , IdDispositivo : String
          , Pin : Number
          , TimeStamp      : { type: Date, default: Date.now }
          , Valor  : Number
          , Proposito : String
          , Ocupado : Boolean
      });
      

      MongoModels = mongoose.model('Sensor', SensorSchema)


      //throw new Error("No implementado");
    }

    if (config.DWEET.Habilitado == "true"){
      _provider.DWEET = true;
      this._dweetClient = new DweetIO();
      Models = require("../dto/Sensor.js");
      _dweet_prefijo = config.DWEET.prefijo_sensor;
    }

    if (config.NEDB.Habilitado == "true"){
      _provider.NEDB = true;
      
      db.Sensor = new Datastore({ filename: './db/Sensor.db', autoload:true});
      //db.Device.loadDatabase();
      /*
      db.Device.ensureIndex({ fieldName: 'Id', unique: true, sparse:true }, function (err) {
        if (err) {
          console.log("Error al crear el indice: Error: " + err.message);
        }
      });
      */
      Models = require("../dto/Sensor.js");
    }
 
}


method.Save = function(dispositivo, sensor, pin, valor) {
    
    if (_provider.MONGO) {

       var medicion = new Models();
        medicion.Crear(sensor, dispositivo, pin, Date.now(), valor);
      var objMongo = new MongoModels(medicion.Objeto());
        objMongo.save(function(err, data) {
          if (err) { _logs.error("SensorProvider: Error al grabar en base de datos. Detalle: +" + err);  }
        });
    }
     
     if (_provider.DWEET) {
      var medicion = new Models();
      medicion.Crear(sensor, dispositivo, sensor, Date.now(), valor);
      
      this._dweetClient.dweet_for(GenerarDweetId(sensor), medicion.Objeto(), function(err, dweet){

          if (err) {console.log(err);} else {
          
          console.log(dweet.thing); // "my-thing"
          console.log(dweet.content); // The content of the dweet
          console.log(dweet.created); // The create date of the dweet
        }


      }); 
    }

     if (_provider.NEDB) {
        var medicion = new Models();
        medicion.Crear(sensor, dispositivo, pin, Date.now(), valor);

        db.Sensor.insert(medicion.Objeto(), function (err, newDoc) {   // Callback is optional
          if (_DEBUG)
            console.log("inserto nueva medicion");
          // newDoc is the newly inserted document, including its _id
          // newDoc has no key called notToBeSaved since its value was undefined
          });
     }

};


method.GetCollection = function(filter, callback) {

 if (_provider.MONGO) {
    var lstModels = [];
    MongoModels.find(filter).exec(function(err, docs) {
       if (err) callback(err, lstModels)
       else {
         if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var sensorModel = new Models();
            sensorModel.Crear(doc.Id,doc.IdDispositivo, doc.Pin, doc.TimeStamp, doc.Valor);
            lstModels.push(sensorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("MONGO: Error al leer async en mettodo GetAll() error : " + error); });
          }
        callback(null, lstModels);
       }
     });
  }

  if (_provider.NEDB) {
      var lstModels = [];
      db.Sensor.find({Id : filter.Id}, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error);
           callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var sensorModel = new Models();
            sensorModel.Crear(doc.Id,doc.IdDispositivo, doc.Pin, doc.TimeStamp, doc.Valor);
            lstModels.push(sensorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
          }
          callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

    this._dweetClient.get_all_dweets_for(GenerarDweetId(filter.Id), function(err, dweets) {
      
      var lstModels = [];

      if (err) {
        console.log("Error al obtener dweets, mensaje de error: " + err);
        callback(err, lstModels);
      }
      else
      {
         

        for(theDweet in dweets)
        {
            var dweet = dweets[theDweet];

            var medicion = new Models();
              medicion.Crear(dweet.content["Id"], dweet.content["IdDispositivo"], dweet.content["Pin"], dweet.content["TimeStamp"], dweet.content["Valor"]);
              lstModels.push(medicion.Objeto());

            console.log(dweet.thing); // The generated name
            console.log(dweet.content); // The content of the dweet
            console.log(dweet.created); // The create date of the dweet
        }
        callback(null, lstModels);
      }
    });
  }



};

method.GetLast = function(filter, callback) {

  if (_provider.MONGO) {

    console.log("SensorProvider.GetLast no implementado para Mongo");
  }

  if (_provider.DWEET) {

    this._dweetClient.get_all_dweets_for(GenerarDweetId(filter.Id), function(err, dweets) {

      var dweet = dweets[0]; // Dweet is always an array of 1
      var medicion = new Models();
      medicion.Crear(dweet.content["Id"], dweet.content["IdDispositivo"], dweet.content["Pin"], dweet.content["TimeStamp"], dweet.content["Valor"]);
      callback(null, medicion);
    });
  }

  if (_provider.NEDB) {

    console.log("SensorProvider.GetLast no implementado para NEDB");
  }



};

function GenerarDweetId(sensor) {
  return _dweet_prefijo + sensor;

};


module.exports = SensorProvider;