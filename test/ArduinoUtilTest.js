var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');

//MAS INFORMACION SOBRE SHOULD:
// http://www.phloxblog.in/node-js-uni-testing-js/#.V28ET7jhCCh


/* Mis variables */

var logger = new winston.Logger({});
var Arduino = require('../lib/util/Arduino.js');
var arduino; 


describe('****** Arduino Util  *********', function() {

  
  // within before() you can run all the operations that are needed to setup your tests. In this case
  // I want to create a connection with the database, and when I'm done, I call done().
  before(function(done) {
    // In our tests we use the test db
    arduino = new Arduino();
    console.dir(arduino);
    done();
    
  
   
    
  });
  // use describe to give a title to your test suite, in this case the tile is "Account"
  // and then specify a function in which we are going to declare all the tests
  // we want to run. Each test starts with the function it() and as a first argument 
  // we have to provide a meaningful title for it, whereas as the second argument we
  // specify a function that takes a single parameter, "done", that we will use 
  // to specify when our test is completed, and that's what makes easy
  // to perform async test!
 
    
   describe('#ArduinoUtil-Dispositivos', function() {
		 
		 it('should return a Relay Device Object', function(done) {
			   	 var dev = arduino.Dispositivos("Relay");
			   	 should.exist(dev);
			   	 done();
		});
		
		it('should return a Sensor Device Object', function(done) {
			   	 var dev = arduino.Dispositivos("Sensor");
			   	 should.exist(dev);
			   	 done();
		});
		
		it('should return a Motor Device Object', function(done) {
			   	 var dev = arduino.Dispositivos("Motor");
			   	 should.exist(dev);
			   	 done();
		});
	
    });
    
    describe('#ArduinoUtil-Operaciones', function() {
		 
		 it('should return a Relay Device Operations Object', function(done) {
			   	 var dev = arduino.Operaciones("Relay");
			   	 dev.Encender.should.equal("E");
			   	 dev.Apagar.should.equal("A");
			   	 dev.Consultar.should.equal("C");
			   	 should.exist(dev);
			   	 done();
		});
		
		it('should return a Sensor Device Operations Object', function(done) {
			   	 var dev = arduino.Operaciones("Sensor");
			   	 should.exist(dev);
			   	 dev.Temperatura.should.equal("T");
			   	 dev.Humedad.should.equal("H");
			   	 done();
		});
		
		it('should return a Motor Device Operations Object', function(done) {
			   	 var dev = arduino.Operaciones("Motor");
			   	 should.exist(dev);
			   	 done();
		});
	
    });
    
     describe('#ArduinoUtil-EstadosMotor', function() {
     
     	it('should return a Motor Status for an Operation', function(done) {
			   	 var dev = arduino.EstadosMotor();
			   	 should.exist(dev);
			   	 dev["D"].should.equal(0);
			   	 dev["A"].should.equal(1);
			   	 dev["R"].should.equal(2);
			   	 done();
		});
     
     
     });
    
	
    
    
    
  });
