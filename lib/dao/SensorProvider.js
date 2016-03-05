/*
 * dao.SensorProvider
 * https://github.com/Gerdenlink
 *
 */

var method = SensorProvider.prototype;

var Models; 
var MongoModels;

var _logs;
var _moment;

var DweetIO = require("node-dweetio");
var _dweetClient;

var _DEBUG = true;

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
          IdSensor : Number
          , IdDispositivo : String
          , Pin : Number
          , TimeStamp      : { type: Date, default: Date.now }
          , Valor  : Number
          , Proposito : String
          , Ocupado : Boolean
          , EsPinAnalogo : Boolean
          , Habilitado : Boolean
      });
      

      MongoModels = mongoose.model('Sensor', SensorSchema)

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
      
      db.Sensor.ensureIndex({ fieldName: 'IdSensor', unique: true, sparse:true }, function (err) {
        if (err) {
          console.log("Error al crear el indice: Error: " + err.message);
        }
      });
      Models = require("../dto/Sensor.js");
    }
 
}


method.Inicializar = function(config){
	 if (_provider.NEDB){
	    
	
		 db.Sensor.find({}, function (err, docs) {
		
			if (docs.length == 0) {
			     
			     console.log("Inicializo base de datos con valores desde archivo de datos iniciales /db/DatosIniciales/Sensor.json");
			     
			      var configuracion = require('../../db/DatosIniciales/Sensor.json');
			      console.dir(configuracion);
			      async.each(configuracion.sensor, function(item, callback) { 
			
			        var sensorModel = new Models();
			        sensorModel.Crear(item.IdSensor,
			        				  item.IdDispositivo, 
			        				  item.Descripcion, 
			        				  item.MarcaModelo, 
			        				  item.Tipo,
			        				  item.Pin,
			        				  item.EsPinAnalogo,
			        				  item.Habilitado);
			        db.Sensor.insert(sensorModel.Objeto(), function (err, newDoc) {   // Callback is optional 
			        });
			
			      });
			  }
		});
	}
};


method.Save = function(IdSensor, IdDispositivo, Descripcion, MarcaModelo, Tipo,Pin,EsPinAnalogo,Habilitado) {
    
    if (_provider.MONGO) {
		
        throw new Error("Sensor.Save no habilitado para MongoDB");
    }
     
     if (_provider.DWEET) {
    
      throw new Error("Sensor.Save no habilitado para Dweet"); 
    }

     if (_provider.NEDB){
      var sensorModel = new Models();
      sensorModel.Crear(IdSensor, 
      					IdDispositivo, 
      					Descripcion, 
      					MarcaModelo, 
      					Tipo,
      					Pin,
      					EsPinAnalogo,
      					Habilitado);
      if (_DEBUG)
        console.log(sensorModel.Objeto());
      //console.log(GenerarDweetId(Id));

      if(sensorModel.Validar(sensorModel.Objeto())) {
      db.Sensor.find({IdSensor : sensorModel.Objeto().IdSensor}, function (err, data) {
        if (data.length == 0) {
          db.Sensor.insert(sensorModel.Objeto(), function (err, newDoc) {   // Callback is optional
          if (_DEBUG)
            console.log("inserto nuevo objeto");
          // newDoc is the newly inserted document, including its _id
          // newDoc has no key called notToBeSaved since its value was undefined
          });
        }
        else
        {
        	console.log(data[0]._id);
          db.Sensor.update({ _id: data[0]._id }, { $set: {
              IdSensor : sensorModel.Objeto().IdSensor,
              IdDispositivo : sensorModel.Objeto().IdDispositivo,
              Descripcion : sensorModel.Objeto().Descripcion,
              MarcaModelo : sensorModel.Objeto().MarcaModelo,
              Tipo : sensorModel.Objeto().Tipo,
              Pin: sensorModel.Objeto().Pin,
              EsPinAnalogo: sensorModel.Objeto().EsPinAnalogo,
              Habilitado : sensorModel.Objeto().Habilitado
              }
            }, { upsert: false } , function (err, numReplaced) { 
              if (_DEBUG)
                console.log("Remplazados: " + numReplaced);
            if (err)
              console.log("Error al updatear" + err);
          });
        }
      });
      }
      else
      {
        if (_DEBUG)
          console.log("SensorProvider.Save() : No se graba objeto debido a que no pasa la validacion de integridad");
      }
    }

};

method.Delete = function(IdSensor) {
	 if (_provider.NEDB){
	 	db.Sensor.remove({ IdSensor: IdSensor }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("Sensor.Delete -> CantEliminados " + numRemoved); 
		});
	 }
};


method.GetCollection = function(filter, callback) {

 if (_provider.MONGO) {
   
     throw new Error("Sensor.GetCollection() no habilitado para Mongo");
  }

  if (_provider.NEDB) {
      var lstModels = [];
      db.Sensor.find({IdSensor : parseInt(filter.IdSensor)}, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error);
           callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var sensorModel = new Models();
            sensorModel.Crear(doc.IdSensor,
            				  doc.IdDispositivo, 
            				  doc.Descripcion, 
            				  doc.MarcaModelo, 
            				  doc.Tipo, 
            				  doc.Pin, 
            				  doc.EsPinAnalogo,
            				  doc.Habilitado);
            lstModels.push(sensorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
          }
          callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

	
    throw new Error("Sensor.GetCollection() no habilitado para Dweet");
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

method.Find = function(filter, callback) {

	if (_provider.NEDB) {
	      var lstModels = [];
	      
	      var filters = {};
	      if (filter.IdSensor)
	      	filters.IdSensor = parseInt(filter.IdSensor);
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("Sensor.method.Find() no se han seteado filtros"); 
	      }
	      
	      
	      db.Sensor.find(filters, function (err, docs) {
	        
	        if (err) {
	           if (_DEBUG) console.log("Error al leer async en mettodo Find() error : " + error);
	           callback(err, lstModels);
	        } 
	        else 
	        {
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var sensorModel = new Models();
		            sensorModel.Crear(doc.IdSensor,
		            				  doc.IdDispositivo, 
		            				  doc.Descripcion, 
		            				  doc.MarcaModelo, 
		            				  doc.Tipo, 
		            				  doc.Pin,
		            				  doc.EsPinAnalogo,
		            				  doc.Habilitado);
		            				  
		            lstModels.push(sensorModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
	          }
	          callback(null, lstModels[0]);
	        }
	      });
	  }

};



method.GetAll = function(callback) {

 if (_provider.MONGO) {
   
     throw new Error("Sensor.GetAll() no habilitado para Mongo");
  }

  if (_provider.NEDB) {
      var lstModels = [];
      db.Sensor.find({}, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error);
           callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var sensorModel = new Models();
            sensorModel.Crear(doc.IdSensor,
            				  doc.IdDispositivo, 
            				  doc.Descripcion, 
            				  doc.MarcaModelo, 
            				  doc.Tipo, 
            				  doc.Pin, 
            				  doc.EsPinAnalogo,
            				  doc.Habilitado);
            lstModels.push(sensorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
          }
          callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

    throw new Error("Sensor.GetAll() no habilitado para Dweet");
  }

};

function GenerarDweetId(sensor) {
  return _dweet_prefijo + sensor;

};


module.exports = SensorProvider;