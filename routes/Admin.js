module.exports = function(app){


app.get('/admin', function (request, response) {
	response.render('admin'); //views/admin.ejs
});

};