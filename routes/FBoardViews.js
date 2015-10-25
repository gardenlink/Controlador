module.exports = function(app) {




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
app.get('/board/views/:id', function (request, response) {
    var idLog = request.params.id;
    console.log("culitoito");
    response.render('bomba');

});





};