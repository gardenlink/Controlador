/*
 * dao.MedicionProvider
 * https://github.com/Gerdenlink
 * 
 */

var method = MedicionProvider.prototype;

var Models; 
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



function MedicionProvider(logs, moment, config) {
  console.log("Inicializando SensorMedicionProvider..");
  _logs = logs;
  
    if (config.MONGO.Habilitado == "true") {
      _provider.MONGO = true;
        Models = require("../dto/Medicion.js");

      var mongoose = config.MONGO.DataSource, Schema = mongoose.Schema;

      var MedicionSchema = new Schema({
           IdTipoActuador : Number
          ,IdActuador : Number
          , IdDispositivo : String
          , TimeStamp      : { type: Date, default: Date.now }
          , Valor  : Number
          });
      

      MongoModels = mongoose.model('Medicion', MedicionSchema)


    }

    if (config.DWEET.Habilitado == "true"){
      _provider.DWEET = true;
      this._dweetClient = new DweetIO();
      Models = require("../dto/Medicion.js");
      _dweet_prefijo = config.DWEET.prefijo_sensor;
    }

    if (config.NEDB.Habilitado == "true"){
      _provider.NEDB = true;
      
      db.Medicion = new Datastore({ filename: './db/Medicion.db', autoload:true});
      
      Models = require("../dto/Medicion.js");
    }
 
}


method.Save = function(idTipoActuador, idActuador, idDispositivo, valor) {
    
    if (_provider.MONGO) {

       var medicion = new Models();
        medicion.Crear(null, idTipoActuador, idActuador, idDispositivo, Date.now(), valor);
      var objMongo = new MongoModels(medicion.Objeto());
        objMongo.save(function(err, data) {
          if (err) { _logs.error("SensorProvider: Error al grabar en base de datos. Detalle: +" + err);  }
        });
    }
     
     if (_provider.DWEET) {
      var medicion = new Models();
      medicion.Crear(null, idTipoActuador, idActuador, idDispositivo, Date.now(), valor);
      
      this._dweetClient.dweet_for(GenerarDweetId(idActuador), medicion.Objeto(), function(err, dweet){

          if (err) {console.log(err);} else {
          
          console.log(dweet.thing); // "my-thing"
          console.log(dweet.content); // The content of the dweet
          console.log(dweet.created); // The create date of the dweet
        }


      }); 
    }

     if (_provider.NEDB) {
        var medicion = new Models();
        medicion.Crear(null, idTipoActuador, idActuador, idDispositivo, Date.now(), valor);
        if (medicion.Validar(medicion.Objeto()))
        {
	        db.Medicion.insert(medicion.Objeto(), function (err, newDoc) {   // Callback is optional
	          if (_DEBUG)
	            console.log("inserto nueva medicion");
	          // newDoc is the newly inserted document, including its _id
	          // newDoc has no key called notToBeSaved since its value was undefined
	          });
        }
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
            sensorModel.Crear(doc._id, doc.IdTipoActuador, doc.IdActuador,doc.IdDispositivo, doc.TimeStamp, doc.Valor);
            lstModels.push(sensorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("MONGO: Error al leer async en mettodo GetAll() error : " + error); });
          }
        callback(null, lstModels);
       }
     });
  }

  if (_provider.NEDB) {
      var lstModels = [];
      
      var filters = {};
      if (filter.IdActuador)
      	filters.IdActuador = filter.IdActuador;
      	
      if (filter.IdTipoActuador)
      	filters.IdTipoActuador = filter.IdTipoActuador;
      	
      if (filter.IdDispositivo)
      	filters.IdDispositivo = filter.IdDispositivo;
      	
       if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("Medicion.method.GetCollection() no se han seteado filtros"); 
	      }
      
      
      db.Medicion.find(filters, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error);
           callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var sensorModel = new Models();
            sensorModel.Crear(doc._id,doc.IdTipoActuador, doc.IdActuador,doc.IdDispositivo, doc.TimeStamp, doc.Valor);
            lstModels.push(sensorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
          }
          callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

    this._dweetClient.get_all_dweets_for(GenerarDweetId(filter.IdSensor), function(err, dweets) {
      
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
              medicion.Crear(0, dweet.content["IdSensor"], dweet.content["IdDispositivo"], dweet.content["TimeStamp"], dweet.content["Valor"]);
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
      medicion.Crear(0, dweet.content["IdSensor"], dweet.content["IdDispositivo"], dweet.content["TimeStamp"], dweet.content["Valor"]);
      callback(null, medicion);
    });
  }

  if (_provider.NEDB) {

    console.log("SensorProvider.GetLast no implementado para NEDB");
  }



};



method.GetAll = function(callback) {

 if (_provider.MONGO) {
    var lstModels = [];
    MongoModels.find(filter).exec(function(err, docs) {
       if (err) callback(err, lstModels)
       else {
         if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var sensorModel = new Models();
            sensorModel.Crear(doc._id, doc.IdTipoActuador, doc.IdActuador,doc.IdDispositivo, doc.TimeStamp, doc.Valor);
            lstModels.push(sensorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("MONGO: Error al leer async en mettodo GetAll() error : " + error); });
          }
        callback(null, lstModels);
       }
     });
  }

  if (_provider.NEDB) {
      var lstModels = [];
      db.Medicion.find({}, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error);
           callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var sensorModel = new Models();
            sensorModel.Crear(doc._id, doc.IdTipoActuador, doc.IdActuador,doc.IdDispositivo, doc.TimeStamp, doc.Valor);
            lstModels.push(sensorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
          }
          callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

    this._dweetClient.get_all_dweets_for(GenerarDweetId(filter.IdSensor), function(err, dweets) {
      
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
              medicion.Crear(0, dweet.content["IdSensor"], dweet.content["IdDispositivo"], dweet.content["Pin"], dweet.content["TimeStamp"], dweet.content["Valor"]);
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

function GenerarDweetId(sensor) {
  return _dweet_prefijo + sensor;

};


module.exports = MedicionProvider;