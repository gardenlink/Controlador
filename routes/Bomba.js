module.exports = function(app, req, moment, logger, dispositivos, bombaProvider) {


  /* REGISTRO DE TIEMPO */
var TiempoTotal = 0;
var TiempoInicial = 0;
var TiempoActual;

var UltimoRiegoTiempo = 0;
var UltimoRiegoFecha;
var Tiempo = 0;

var BombaService = require("../lib/servicios/BombaService.js");
var bombasvc = new BombaService(dispositivos,logger);

/* INICIO API REST */

/**
 * @api {get} /bomba/:id Obtiene la informacion de la bomba
 * @apiName bomba
 *
 * @apiParam {String} id de la bomba (Pin de conexion en Arduino)
 *
 * @apiSuccess {Json} informacion de la bomba.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    {"supportedModes":[0,1,2],
 *      "mode":1,
 *      "value":0,
 *      "report":1,
 *      "analogChannel":0,
 *      "state":0,
 *      "id":14,
 *      "TiempoEncendida":0,
 *      "UltimoRiegoFecha":"2015-02-21T16:12:00.252Z",
 *      "UltimoRiegoTiempo":0}
 *
 * @apiError ECONNREFUSED.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "ECONNREFUSED"
 *     }
 */
app.get('/bomba/:id', function (request, response) {
    var idBomba = request.params.id;
      
    try {


      bombasvc.GetEstadoBomba(idBomba, function(data) {

          if (data instanceof Error) {
           logger.error('Ens la llamada al servicio /bomba/:id -> ERROR : ', data);
           response.json(data);
          }
           else
           {
            if (data["Encendida"] == true && TiempoInicial == 0)
            {
                TiempoInicial = moment();
            }


            if (TiempoInicial > 0)
            {
              TiempoTotal = TiempoInicial.fromNow(true);
              logger.info("Bomba encendida durante " + TiempoInicial.fromNow(true));
            }

            var valor = 0;
           
            if (data["Encendida"]) 
            {

              valor = 255;
            }
            bombaProvider.Save(idBomba, valor,TiempoTotal,TiempoInicial);
            
            data["TiempoEncendida"] = TiempoTotal;
            data["UltimoRiegoFecha"] = UltimoRiegoFecha;
            data["UltimoRiegoTiempo"] = UltimoRiegoTiempo;
            response.json(data);
           }

      });

    
    } catch(exception) 
    {
      logger.error("/bomba/:id -> Error: " + exception);
    }
});






/**
 * @api {get} /activarBomba/:id Activa la bomba ubicada en el pin recibido como parametro
 * @apiName activarBomba
 *
 * @apiParam {String} id de la bomba (Pin de conexion en Arduino)
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


app.get('/activarBomba/:id', function (request, response) {
    var idBomba = request.params.id;
    try {
      
        bombasvc.ActivarBomba(idBomba, function(data) {

          if (data instanceof Error) {
             logger.error('En la llamada al servicio /activarBomba/:id -> ERROR : ', data);
             //response.sendStatus(404);
          } 
          else
          {
            if(TiempoInicial == 0) {
            TiempoInicial = moment();
            UltimoRiegoFecha = new Date();
            }

            bombaProvider.Save(idBomba, 255, 0,TiempoInicial);


            response.end();
          }
          });
         
    } catch (exception) {
        logger.error("/activarBomba/:id -> Error: " + exception);
        //response.sendStatus(404);
    }
    
});





/**
 * @api {get} /desactivarBomba/:id Activa la bomba ubicada en el pin recibido como parametro
 * @apiName activarBomba
 *
 * @apiParam {String} id de la bomba (Pin de conexion en Arduino)
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

app.get('/desactivarBomba/:id', function (request, response) {
    var idBomba = request.params.id;
    try {

      
        bombasvc.DesactivarBomba(idBomba, function(data) {
        if (data instanceof Error) {
            logger.error('En la llamada al servicio /desactivarBomba/:id -> ERROR : ', data);
            //response.sendStatus(404);
        }
        else
        {
        UltimoRiegoTiempo = TiempoTotal;
        TiempoInicial = 0;
        TiempoTotal = 0;

        bombaProvider.Save(idBomba, 0,UltimoRiegoTiempo,TiempoInicial);
        response.end();
        }
        });
    
           
    } catch (exception) {
        logger.error("/desactivarBomba/:id -> Error: " + exception);
        //response.sendStatus(404);
    }
    
});

};