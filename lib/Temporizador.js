/*
 * Temporizador
 * https://github.com/Botanicbot/App/Temporizador.js
 * 
 * 2015 Diego Navarro M
 *
 */


var method = Temporizador.prototype;
var later = require('later'); // gestion de tareas
var _logger;
var _mailer;
var _twitter;
var _programacion = [];
var BombaService;// = require("./servicios/BombaService.js");
var _bombasvc;
var BombaProvider = require("./dao/BombaProvider.js");


 var _bombaprovider;

/*
 * Temporizador
 * @constructor
 *
 * @description Inicializa y Configura el programador
 * @apiParam {Number} horarios durante un dia determinado
 * @apiParam {Number} duracion cantidad minutos que durará la tarea
 * @apiParam {Number} numeroDias cantidad de dias que se programará la tarea.
 *
 */
function Temporizador(config, logger, mailer, tweet, dataProvider) {
   
	 this._logger = logger;
	 this._mailer = mailer;
	 this._twitter = tweet;

	 later.date.localTime();
    
   		dataProvider.TipoActuador().Find({Descripcion : "Sensor"}, function (err, data){
   			var filter = {};
	   		if (data && data.length > 0)
	   		{
		   		filter.IdTipoActuador = data.IdTipoActuador;
		   		dataProvider.Temporizador().GetCollection(filter, function(err, data) {
		   		temporizadores = data;
		   		console.log(temporizadores);
	   			});
	   		}	
   		});
}
   	
   	
   	
   	
   	/*
   //actuadores = config.actuadores;
   var numTemporizadores =  Object.keys(temporizadores).length;
   var numDeshabilitados = 0;
   console.log("Temporizador: Numero de dispositivos configurados: " +numTemporizadores);

   
   this._programacion = [];
   for (var temp in temporizadores)
   {
     
      if (temporizadores[temp].habilitado == "true" || temporizadores[temp].habilitado == true) {
        var dispositivo = BuscarDispositivo(temporizadores[temp].dispositivo, dispositivos);
        var actuador = BuscarActuador(temporizadores[temp].actuador, actuadores);
        
        if (dispositivo && actuador)
        {

            temporizadores[temp]["dispositivo"] = dispositivo;
            temporizadores[temp]["actuador"] = actuador;

            console.log("**Configurando dispositivo <" + temp + ">");
            console.log("Dispositivo asociado : " + temporizadores[temp].dispositivo["id"]);
            console.log("Actuador asociado    : " + temporizadores[temp].actuador["id"]);
            console.log("Habilitado           : " + temporizadores[temp].habilitado);
            console.log("Duracion encendido   : " + temporizadores[temp].duracion);
            console.log("Numero ciclos(dias)  : " + temporizadores[temp].numeroDias);
            console.log("Horas Activacion     : " + temporizadores[temp].horas);

            var horarios = temporizadores[temp].horas.split(";");

            temporizadores[temp]["configEncendido"] = {schedules: [
            {h: [parseInt(horarios[0].split(":")[0])], m: [parseInt(horarios[0].split(":")[1])]},
            {h: [parseInt(horarios[1].split(":")[0])], m: [parseInt(horarios[1].split(":")[1])]},
            {h: [parseInt(horarios[2].split(":")[0])], m: [parseInt(horarios[2].split(":")[1])]}
            ]};


            temporizadores[temp]["configApagado"] = {schedules: [
            {h: [parseInt(horarios[0].split(":")[0])], m: [parseInt(horarios[0].split(":")[1]) + parseInt(temporizadores[temp].duracion)]},
            {h: [parseInt(horarios[1].split(":")[0])], m: [parseInt(horarios[1].split(":")[1]) + parseInt(temporizadores[temp].duracion)]},
            {h: [parseInt(horarios[2].split(":")[0])], m: [parseInt(horarios[2].split(":")[1]) + parseInt(temporizadores[temp].duracion)]}
            ]};

            //console.log(temporizadores[temp]["configApagado"].schedules);

            this._programacion.push(temporizadores[temp]);
        }
        else {
          console.log("Temporizador <" + temp + "> no tiene un dispositivo valido..");
        }

      } else {
        console.log("Temporizador <" + temp + "> esta deshabilitado..")
        numDeshabilitados++;
      }
   }

   if (numDeshabilitados < numTemporizadores) {

    this._bombasvc = new BombaService(dispositivos, this._logger);
    this._bombaprovider = dataProvider.Bomba();
   }
   else
   {
      console.log("Los dispositivos estan deshabilitados, no se programa ninguna actiidad..");
   }
 }
*/


method.ListarEncendidasProgramadas = function() {
	return _prendidas;
};

method.ListarApagadasProgramadas = function() {
	return this._apagadas;
};

method.Iniciar = function() {
         
   var logger = this._logger;
   var mailer = this._mailer;
   var twitter = this._twitter;
   var bombasvc = this._bombasvc;
   var bombaprovider = this._bombaprovider;

   var t = [];
   for(var p in this._programacion) {
      var actuador = this._programacion[p].actuador["id"];
      var confEncendido = later.schedule(this._programacion[p].configEncendido).next(this._programacion[p].numeroDias);
      var confApagado = later.schedule(this._programacion[p].configApagado).next(this._programacion[p].numeroDias)
      Init(actuador, this._programacion[p].configEncendido, this._programacion[p].configApagado, bombasvc, bombaprovider, logger, mailer, twitter);
   }
  }

  function Init(actuador, configEncendido, configApagado, bombasvc, bombaprovider,logger, mailer, twitter)
  {
    var x = later.setInterval(function() { Activar( actuador,bombasvc,bombaprovider,logger,mailer,twitter); }, configEncendido);
    var y = later.setInterval(function() { Desactivar(actuador, bombasvc,bombaprovider,logger,mailer,twitter); }, configApagado)
  }


	function Activar(idActuador, bombasvc, bombaprovider, logger,mailer, twitter)
	{
		logger.info("Temporizador: Encendiendo Actuador.." + idActuador);

    bombasvc.ActivarBomba(idActuador, function(data) {
      if (data instanceof Error)
      { 
        logger.error("Temporizador: Error al Activar Actuador " + idActuador + ", detalle: " + data);
        mailer.Enviar("Error al encender actuador", "Temporizador: Error al Activar Actuador " + idActuador +" , detalle: " + data);
        twitter.Enviar("Tengo un problema al intentar encender el actuador " + idActuador + "... " + data);
      }
      else
      {
        logger.info("Temporizador: ..Actuador " + idActuador + "Activado");
        //req.get('http://' + host + ':'+ port+'/bomba/A0').on('complete', function(data, response) {});
        bombaprovider.Save(data.Id, 255, 0, Date.now );
      }
    });
	}

	function Desactivar(idActuador, bombasvc,bombaprovider,logger,mailer, twitter)
	{
		logger.info("Temporizador: Apagando Actuador ID : " + idActuador);

     bombasvc.DesactivarBomba(idActuador, function(data) {

      	if (data instanceof Error || data.toString().indexOf("ECONNREFUSED") > -1) 
      	{
      		logger.error("Temporizador: Error al Desactivar Actuador " + idActuador +", detalle: " + data);
      		mailer.Enviar("Error al apagar actuador", "Temporizador: Error al Apagar Actuador " + idActuador + ", detalle: " + data);
      		twitter.Enviar("Tengo un problema al intentar desactivar el actuador" + idActuador + "... " + data);
      	}
      	else
      	{
      		logger.info("Temporizador: Actuador " + idActuador + " Desactivado");

          bombaprovider.GetLast({Id : data.Id}, function(error, objBomba) {
              
              bombaprovider.Save(objBomba.Id, 0,objBomba.TiempoTotal,objBomba.TiempoInicial);

          });
      	}

      });
	 }
  
    function BuscarDispositivo(id, dispositivos)
    {
      var found = null;
      for (var d in dispositivos)
      {
          if (dispositivos[d].id == id)
          {
            found = dispositivos[d];
          }
      }

      if (!found)
        console.log("dispositivo no encontrado");

      return found;
    }

    function BuscarActuador(id, actuadores)
    {
      var found = null;
      for (var d in actuadores)
      {
          if (actuadores[d].id == id)
          {
            found = actuadores[d];
          }
      }

      if (!found)
        console.log("actuador no encontrado");

      return found;
    }


  //return this._tareas;



module.exports = Temporizador;
