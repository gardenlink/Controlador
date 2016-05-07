var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');
//var config = require('./config-debug');

/* Mis variables */

var logger = new winston.Logger({});
var DataProvider = require('../lib/dao/DataProvider.js');
var ServiceProvider = require('../lib/servicios/ServiceProvider.js');




describe('Motor', function() {

 var dataProvider;
 var serviceProvider;
  
  // within before() you can run all the operations that are needed to setup your tests. In this case
  // I want to create a connection with the database, and when I'm done, I call done().
  before(function(done) {
    // In our tests we use the test db
    //mongoose.connect(config.db.mongodb);	
    var environment = "debug";
    var config = require("../config.json")[environment];
    dataProvider = new DataProvider(logger, config, null);
	serviceProvider = new ServiceProvider(dataProvider, logger, function(err, data){   });
    done();
   
    						
    
  });
  // use describe to give a title to your test suite, in this case the tile is "Account"
  // and then specify a function in which we are going to declare all the tests
  // we want to run. Each test starts with the function it() and as a first argument 
  // we have to provide a meaningful title for it, whereas as the second argument we
  // specify a function that takes a single parameter, "done", that we will use 
  // to specify when our test is completed, and that's what makes easy
  // to perform async test!
  describe('#Estado', function() {
    it('should return values', function(done) {
      
      	var idMotor = 1;
     	serviceProvider.Motor().Estado(idMotor, function (error, data) {
     		if (error) { return done(error); }
     		
     		data.should.not.equal(null);
     		done();	
     	});
    	
	
        });
    });
    
    
    //Prueba metodo Refrescar
    
    describe('#Refrescar', function() {
    it('should return values', function(done) {
      
      	var idMotor = 1;
      	var idDispositivo = "001";
     	serviceProvider.Motor().Estado(idDispositivo, idMotor, function (error, data) {
     		if (error) { return done(error); }
     		
     		data.should.not.equal(null);
     		done();	
     	});
    	
	
        });
    });
    
    
  });
