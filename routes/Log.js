module.exports = function(app, auxiliares, logger, tareas,fs, dirname) {




/**
 * @api {get} /log/:id Entrga los logs del dia actual
 * @apiName log
 * @apiParam {Number} id del dia (ejemplo 1 para el dia actual)
 *
 * @apiSuccess {Json} informacion de la bomba.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    "{\"level\":\"info\",
 *      \"message\":\"Temporizador: Encendiendo Bomba..\",
 *      \"timestamp\":\"2015-02-21T12:10:00.092Z\"}
 *
 *
 * @apiError 404 HTTP Code
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     
 */
app.get('/log/:id', function (request, response) {
    var idLog = request.params.id;
    try {
      
            var contents = fs.readFileSync(dirname +'/logs/log_file.log.' + auxiliares.DateParse_yyyy_mm_dd(new Date()), {encoding: 'utf8'}).toString();

            response.json(contents);


    } catch (exception) {
      console.log(exception);
      logger.error("En servicio log: Archivo no existe, creando... ");
      //response.sendStatus(404);
    }
    
});








/**
 * @api {get} /log/:id Entrga el programa de activaciones automaticas de la bomba para los dias seteados en el archivo de configuracion
 * @apiName log
 * @apiParam {Number} id del dia (ejemplo 1 para el dia actual)
 *
 * @apiSuccess {Json} informacion de la bomba.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    { 
 *     ["2015-02-18T12:10:00.000Z",
 *     "2015-02-18T16:12:00.000Z",
 *     "2015-02-18T20:15:00.000Z",
 *     "2015-02-19T16:12:00.000Z",
 *     "2015-02-19T20:15:00.000Z",
 *     "2015-02-20T12:10:00.000Z",
 *     "2015-02-20T16:12:00.000Z",
 *     "2015-02-20T20:15:00.000Z",
 *     "2015-02-21T12:10:00.000Z"]
 *    } 
 *
 *
 *
 * @apiError Codigo de error HTTP 404 si existe un problema al consultar el calendario de activaciones
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     
 */


app.get('/temporizador/:id', function (request, response) {
    var action = request.params.id;
    try {
          var lista = tareas.ListarEncendidasProgramadas();
          response.json(lista);

    } catch (exception) {
        logger.error("Exception en /temporizador/ -> Error : " + exception);
        //response.sendStatus(404);
    }
    
});







};