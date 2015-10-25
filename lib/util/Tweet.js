/*
 * Twitter Helper
 * https://github.com/Botanicbot/App/Tweet.js
 * 
 * 2015 Diego Navarro M
 *
 */

var method = Tweet.prototype;

var tweetApi = require("node-twitterbot").TwitterBot;
var Auxiliares = require("./Auxiliares.js");
var auxiliares;

//config twitter

var _consumer_secret;
var _consumer_key;
var _conf_enabled;  //servicio habilitado
var _access_token;
var _access_token_secret;

//log
var _logger;
var Bot;

/**
* config : the configuratio object (Json Format)
* logger : winston preconfigured object
*/
function Tweet(config, logger)
{

	//load Config
	_conf_enabled = config.twitter_enabled;
	_consumer_secret = config.twitter_consumer_secret;
	_consumer_key = config.twitter_consumer_key;
	_access_token = config.twitter_access_token;
	_access_token_secret = config.twitter_access_token_secret;

	this._logger = logger;
	auxiliares = new Auxiliares();

	if (_conf_enabled == true || _conf_enabled == "true")
	{
		// informacion obtenida desde la api twitter. Ver https://apps.twitter.com
		Bot = new tweetApi({
		  "consumer_secret": _consumer_secret,
		  "consumer_key": _consumer_key,
		  "access_token": _access_token,
		  "access_token_secret": _access_token_secret
		});
	}

}

method.Enviar = function(texto) {

	if (_conf_enabled == true || _conf_enabled == "true") {
		Bot.addAction("tweet", function(twitter, action, tweet) {
  			Bot.tweet(auxiliares.DateParse_dd_mm_yyyy_hh_mm(new Date()) + ": " +texto);
		});

		Bot.now("tweet");

		Bot.removeAction("tweet");
	}

	return true;
};



module.exports = Tweet;