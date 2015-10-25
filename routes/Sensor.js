module.exports = function(app, req, moment, logger, dispositivos) {


  /* REGISTRO DE TIEMPO */
var TiempoTotal = 0;
var TiempoInicial = 0;
var TiempoActual;

var UltimoRiegoTiempo = 0;
var UltimoRiegoFecha;
var Tiempo = 0;

var SensorService = require("../lib/servicios/SensorService.js");
var sensorsvc = new SensorService(dispositivos,logger);

/* INICIO API REST */


/**
 * @api {get} /sensor/:id Obtiene la informacion del sensor
 * @apiName sensor
 *
 * @apiParam {String} id del sensor(Pin de conexion en Arduino)
 *
 * @apiSuccess {Json} informacion del sensor
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *     "id": 19,
 *     "freq": 900,
 *     "value": 750,
 *     "active": true
 *     }
 *
 * @apiError ECONNREFUSED.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "ECONNREFUSED"
 *     }
 */


app.get('/sensor/:id', function (request, response) {
    var idSensor = request.params.id;
    try {

         sensorsvc.GetEstadoSensorAnalogo(idSensor, function(data) {

           if (data instanceof Error) {
           logger.error('En la llamada al servicio /sensor/:id -> ERROR : ', data);
           response.json(data);
           }
           else
           {
            response.json(data);
           }
         
        });
    

    } catch (exeception) {
        //response.sendStatus(404);
    }
    
});








/**
 * @api {get} /activarSensor/:id Activa el sensor ubicada en el pin analogo recibido como parametro
 * @apiName activarBomba
 *
 * @apiParam {String} id del sensor (Pin de conexion en Arduino)
 *
 * @apiSuccess {String} 200 HTTP CODE
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *   
 *
 * @apiError ECONNREFUSED.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "ECONNREFUSED"
 *     }
 */


app.get('/activarSensor/:id', function (request, response) {
    var idSensor = request.params.id;
    try {
        //var jsonData = { active: 1, freq : 1000 }        
        sensorsvc.ActivarSensor(idSensor, function(data) {
          
          if (data instanceof Error) {
             logger.error('En la llamada al servicio /activarSensor/:id -> ERROR : ', data);
             //response.sendStatus(404);
          } 
          else
          {
            response.json(data);
            //response.sendStatus(200);
          }
          });
         
    } catch (exception) {
        logger.error("/activarSensor/:id -> Error: " + exception);
        //response.sendStatus(404);
    }
    
});


/**
 * @api {get} /desactivarSensor/:id Desactiva el sensor ubicada en el pin recibido como parametro
 * @apiName desactivarSensor
 *
 * @apiParam {String} id del sensor (Pin de conexion en Arduino)
 *
 * @apiSuccess {String} 200 OK
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *   
 *
 * @apiError ECONNREFUSED.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "ECONNREFUSED"
 *     }
 */

app.get('/desactivarSensor/:id', function (request, response) {
    var idSensor = request.params.id;
    try {
      
        
        sensorsvc.DesactivarSensor(idSensor, function(data) {
         
        if (data instanceof Error) {
            logger.error('En la llamada al servicio /desactivarSensor/:id -> ERROR : ', data);
            //response.sendStatus(404);
        }
        else
        {
          response.json(data);
        }
        });
    
           
    } catch (exception) {
        logger.error("/desactivarSensor/:id -> Error: " + exception);
        //response.sendStatus(404);
    }
    
});


app.get('/sensor/Temperatura/:id', function (request, response) {
    var idSensor = request.params.id;
    try {

         sensorsvc.GetTemperatura(idSensor, function(data) {
      
           if (data instanceof Error) {
           logger.error('En la llamada al servicio /sensor/Temperatura/:id -> ERROR : ', data);
           response.json(data);
           }
           else
           {
            response.json(data);
           }
         
        });
    

    } catch (exeception) {
        //response.sendStatus(404);
    }
    
});

app.get('/sensor/Humedad/:id', function (request, response) {
    var idSensor = request.params.id;
    try {

         sensorsvc.GetHumedad(idSensor, function(data) {
        
           if (data instanceof Error) {
           logger.error('En la llamada al servicio /sensor/Humedad/:id -> ERROR : ', data);
           response.json(data);
           }
           else
           {
            response.json(data);
           }
         
        });
    

    } catch (exeception) {
        //response.sendStatus(404);
    }
    
});



};