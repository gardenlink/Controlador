module.exports = function(app, moment, dataProvider, serviceProvider, logger) {

var Medicion = require("../lib/dto/Medicion.js");
var objMedicion = new Medicion();

var Auxiliares = require('../lib/util/Auxiliares.js');
var helper = new Auxiliares();

var req = require('restler');
var async = require('async');
var _ = require('underscore');
var server = "localhost";
var port = 9000;


/* INICIO API REST */

var dispositivos = {};
var motores = {};
var relays = {};
var sensores = {};
var datos = {};

var _DEBUG = true;


app.get('/api/v1/servicio/consolidado', function(request, response, next){

		dataProvider.Cache(true, function(error, data ) {
				response.json(data);
			});
});


}