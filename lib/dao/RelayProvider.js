/*
 * dao.RelayProvider
 * https://github.com/Gerdenlink
 * 
 */

var method = RelayProvider.prototype;

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



function RelayProvider(logs, moment, config) {
  console.log("Inicializando RelayProvider..");
  _logs = logs;
  
    if (config.MONGO.Habilitado == "true") {
      _provider.MONGO = true;
        Models = require("../dto/Relay.js");

      var mongoose = config.MONGO.DataSource, Schema = mongoose.Schema;

      var RelaySchema = new Schema({
          Id : Number
          , IdDispositivo : String
          , Pin : Number
          , TimeStamp      : { type: Date, default: Date.now }
          , Valor  : Number
          , Proposito : String
          , Ocupado : Boolean
          , EsPinAnalogo : Boolean
          , Habilitado : Boolean
          , EsInverso : Boolean
      });
      

      MongoModels = mongoose.model('Relay', RelaySchema)

    }

    if (config.DWEET.Habilitado == "true"){
      _provider.DWEET = true;
      this._dweetClient = new DweetIO();
      Models = require("../dto/Relay.js");
      _dweet_prefijo = config.DWEET.prefijo_relay;
    }

    if (config.NEDB.Habilitado == "true"){
      _provider.NEDB = true;
      
      db.Relay = new Datastore({ filename: './db/Relay.db', autoload:true});
      db.Relay.ensureIndex({ fieldName: 'IdRelay', unique: true, sparse:true }, function (err) {
        if (err) {
          console.log("Error al crear el indice: Error: " + err.message);
        }
      });
      Models = require("../dto/Relay.js");
    }
 
}


method.Inicializar = function(config){
	 
	 if (_provider.NEDB){
		 db.Relay.find({}, function (err, docs) {
		
			if (docs.length == 0) {
			     
			     console.log("Inicializo base de datos con valores desde archivo de datos iniciales /db/DatosIniciales/Relay.json");
			     
			      var configuracion = require('../../db/DatosIniciales/Relay.json');
			      console.dir(configuracion);
			      async.each(configuracion.relay, function(item, callback) { 
			
			        var relayModel = new Models();
			        relayModel.Crear(item.IdRelay,
			        				  item.IdDispositivo, 
			        				  item.Descripcion, 
			        				  item.MarcaModelo, 
			        				  item.Tipo,
			        				  item.Pin,
			        				  item.EsPinAnalogo,
			        				  item.Habilitado,
			        				  item.EsInverso);
			        db.Relay.insert(relayModel.Objeto(), function (err, newDoc) {   // Callback is optional 
			        });
			
			      });
			  }
		});
	}
};


method.Delete = function(IdRelay) {
	 if (_provider.NEDB){
	 	db.Relay.remove({ IdRelay: IdRelay }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("Relay.Delete -> CantEliminados " + numRemoved); 
		});
	 }
};

method.Save = function(IdRelay, IdDispositivo, Descripcion, MarcaModelo, Tipo,Pin,EsPinAnalogo, Habilitado,EsInverso ) {
    
    if (_provider.MONGO) {
        throw new Error("relay.Save no habilitado para MongoDB");
    }
     
     if (_provider.DWEET) {
      
      throw new Error("relay.Save no habilitado para Dweet"); 
    }

      if (_provider.NEDB){
	      var relayModel = new Models();
	      relayModel.Crear(IdRelay, IdDispositivo, Descripcion, MarcaModelo, Tipo,Pin,EsPinAnalogo,Habilitado,EsInverso);
	      
	      if (_DEBUG)
	        console.log(relayModel.Objeto());
	
	      if(relayModel.Validar(relayModel.Objeto())) {
	      db.Relay.find({IdRelay : relayModel.Objeto().IdRelay}, function (err, data) {
	        if (data.length == 0) {
	          db.Relay.insert(relayModel.Objeto(), function (err, newDoc) {   // Callback is optional
	          if (_DEBUG)
	            console.log("inserto nuevo objeto");
	          // newDoc is the newly inserted document, including its _id
	          // newDoc has no key called notToBeSaved since its value was undefined
	          });
	        }
	        else
	        {
	          db.Relay.update({ _id: data[0]._id }, { $set: {
	              IdRelay : relayModel.Objeto().IdRelay,
	              IdDispositivo : relayModel.Objeto().IdDispositivo,
	              Descripcion : relayModel.Objeto().Descripcion,
	              MarcaModelo : relayModel.Objeto().MarcaModelo,
	              Tipo : relayModel.Objeto().Tipo,
	              Pin: relayModel.Objeto().Pin,
	              EsPinAnalogo: relayModel.Objeto().EsPinAnalogo,
	              Habilitado: relayModel.Objeto().Habilitado,
	              EsInverso: relayModel.Objeto().EsInverso
	              }
	            }, { multi : true}, function (err, numReplaced) {
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
	          console.log("RelayProvider.Save() : No se graba objeto debido a que no pasa la validacion de integridad");
	      }
    }

};


method.GetCollection = function(filter, callback) {

 if (_provider.MONGO) {
    
     throw new Error("relay.GetCollection() no habilitado para Mongo");
  }

  if (_provider.NEDB) {
      var lstModels = [];
      
      var filters = {};
      if (filter.IdRelay)
      	filters.IdRelay = parseInt(filter.IdRelay);
      	
      if (filter.IdDispositivo)
      	filters.IdDispositivo = filter.IdDispositivo;
      
      db.Relay.find(filters, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error);
           callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var relayModel = new Models();
            relayModel.Crear(doc.IdRelay,doc.IdDispositivo, doc.Descripcion, doc.MarcaModelo, doc.Tipo, doc.Pin, doc.EsPinAnalogo,doc.Habilitado, doc.EsInverso);
            lstModels.push(relayModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
          }
          callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

	
    throw new Error("relay.GetCollection() no habilitado para Dweet");
  }



};

method.GetLast = function(filter, callback) {

  if (_provider.MONGO) {

    console.log("relayProvider.GetLast no implementado para Mongo");
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

    console.log("relayProvider.GetLast no implementado para NEDB");
  }



};

method.Find = function(filter, callback) {

	if (_provider.NEDB) {
	      var lstModels = [];
	      
	      var filters = {};
	      if (filter.IdRelay)
	      	filters.IdRelay = parseInt(filter.IdRelay);
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("Relay.method.Find() no se han seteado filtros"); 
	      }
	      
	      db.Relay.find(filters, function (err, docs) {
	        
	        if (err) {
	           if (_DEBUG) console.log("Error al leer async en mettodo Find() error : " + error);
	           callback(err, lstModels);
	        } 
	        else 
	        {
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var relayModel = new Models();
		            relayModel.Crear(doc.IdRelay,
		            				  doc.IdDispositivo, 
		            				  doc.Descripcion, 
		            				  doc.MarcaModelo, 
		            				  doc.Tipo, 
		            				  doc.Pin,
		            				  doc.EsPinAnalogo,
		            				  doc.Habilitado,
		            				  doc.EsInverso);
		            				  
		            lstModels.push(relayModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
	          }
	          callback(null, lstModels[0]);
	        }
	      });
	  }

};



method.GetAll = function(callback) {

 if (_provider.MONGO) {
   
     throw new Error("relay.GetAll() no habilitado para Mongo");
  }

  if (_provider.NEDB) {
      var lstModels = [];
      db.Relay.find({}, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error);
           callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var relayModel = new Models();
            relayModel.Crear(doc.IdRelay,doc.IdDispositivo, doc.Descripcion, doc.MarcaModelo, doc.Tipo, doc.Pin, doc.EsPinAnalogo,doc.Habilitado, doc.EsInverso);
            lstModels.push(relayModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
          }
          callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

	
    throw new Error("relay.GetAll() no habilitado para Dweet");
  }



};

function GenerarDweetId(relay) {
  return _dweet_prefijo + relay;

};


module.exports = RelayProvider;