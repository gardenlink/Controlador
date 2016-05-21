module.exports = function(app){

app.get('/console', function (request, response) {
	response.render('console'); //views/console.ejs
});

};