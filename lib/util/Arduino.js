var method = Arduino.prototype;

var cmd_restart = "QRPX";
var cmd_network_reset = "QNRX";
var cmd_status = "QSTX";


var Dispositivos = {
	Sensor : "S",
	Relay : "R",
	Motor : "M",
	Board : "B"
};

var Operaciones = {
	Sensor : {
		Temperatura : "T",
		Humedad : "H",
		PH : "P",
		EC : "E",
		Lluvia : "L",
		HumedadTierra : "S"
	},
	Relay : {
		Encender : "E",
		Apagar : "A",
		Consultar: "C"
	},
	Motor : {
		Avanzar : "A",
		Retroceder : "R",
		Detener : "D",
		Estado : "E",
		Posicion : "P"
	}
};

var EstadosMotor = {
	"D" : 0,
	"A" : 1,
	"R" : 2
};

//TODO: Incorporar al modelo
var TipoActuador = {
	Sensor : 1,
	Relay : 2,
	Motor : 3,
	Bomba : 4
};



function Arduino()
{
}


method.Dispositivos = function(filter) {
	return Dispositivos[filter];
};



method.Operaciones = function(dispositivo) {
	return Operaciones[dispositivo];
	
};

method.EstadosMotor = function() {
	return EstadosMotor;
};

method.TipoActuador = function() {
	return TipoActuador;
};

method.cmd_restart = function() {
	return cmd_restart;
};

method.cmd_network_reset = function() {
	return cmd_network_reset;
};

method.cmd_status = function() {
	return cmd_status;
};

method.cmd_escape = function() {
	return "N";
};



/*
method.Operaciones = function(tipo) {
	var ret = null;
	switch (tipo) {
	
		case 1:
			ret = Operaciones.Sensor;
			break;
			
		case 2:
			ret = Operaciones.Relay;
			break;
			
		case 3:
			ret = Operaciones.Motor;
			break;
	}
	
	return ret;
};



method.Dispositivos = function(tipo) {
	
	var ret = null;
	switch (tipo) {
	
		case 1:
			ret = Dispositivos.Sensor;
			break;
			
		case 2:
			ret = Dispositivos.Relay;
			break;
			
		case 3:
			ret = Dispositivos.Motor;
			break;
	}
	
	return ret;
}; 
*/
module.exports = Arduino;