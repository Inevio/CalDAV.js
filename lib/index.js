
//Modules
	var async      = require('async');
	var tools      = require('./tools.js');
	var Mustache   = require('mustache');
	var fs         = require('fs');
	var path	   = require('path');
	var _ 		   = require("lodash");
	var Handlebars = require('handlebars');
	_.mixin(require("lodash-deep"));

//Global Variables
	var templates = {};

//Private functions
	(function loadTemplates(){
		
		var files = fs.readdirSync(__dirname + '/templates');

		files.forEach(function(templateDir){
			templates[templateDir] = fs.readFileSync(__dirname + '/templates/' + templateDir, {encoding : 'utf8'});
			templates[templateDir] = Handlebars.compile(templates[templateDir]);
		});

	})();

//Public functions

	Mustache.escape = function(string){
		return string;
	};

	var Sync = function( config ){
		this.config = config;
		this.protocol
	};

	Sync.prototype.createCalendar = function( path, info, callback ){

		if(!path){
			return callback({err : "Error: path required"});
		}

		if(!info['supported-components'] || !info['supported-components'].length){
			info['supported-components'] = ['VEVENT'];
		}

		var body = templates['newCalendar'](info);
		path = path + tools.uuid() + '/';

		this.request('MKCOL', path, body, function (err, res) {

			if (err || res.statusCode !== 201) {
				callback({err : err, statusCode : res.statusCode});
				return;
			}

			callback(null, path);
		});
	};

	Sync.prototype.createEvent = function ( path, info, callback ) {

		info.uuid 	  		= tools.uuid();
		info.created  		= tools.generateIcalTime(tools.generateUTCTime(new Date())) + 'Z';
		info.type        	= info.type || 'VEVENT';
		info.start     		= tools.generateIcalTime(info.start);
		info.end       		= tools.generateIcalTime(info.end);

		var body = templates['newEvent'](info);
		body = body.replace(/^\s*$[\n\r]{1,}/gm, '');

		path = path + info.uuid + '.ics';

		this.request( 'PUT', path, body, function (err, res) {

			if (err || res.statusCode !== 201) {
				callback({err : err, statusCode : res.statusCode});
				return;
			}

			callback(null, path);
		});
	};

	Sync.prototype.deleteCalendar = function ( path, callback ) {

		this.request('DELETE', path, '', function (err, res) {
			callback(err);
		});

	};

	Sync.prototype.deleteEvent = function ( path, callback ) {

		this.request('DELETE', path, '', function (err, res) {
			callback(err);
		});

	};

	Sync.prototype.getCalendars = function( calHome, callback ){

		var body = templates['getCalendars']();

		this.request( 'PROPFIND', { path : calHome, depth : 1 }, body, function( error, res ){

			tools.parseXML( res.body, function ( err, data ){

				if( err ){
					return callback( err );
				}

				var calendars = _.map(data.response, function(internal){
					var newObj = {};
					newObj.href = internal.href;
					newObj = _.extend(newObj, _.deepGet(internal, 'propstat[0].prop[0]'));
					newObj = _.reduce(newObj, tools.normalizeCalendarAttribute, {});
					return newObj;
				});

				callback(null, calendars);

			});

		});

	};

	Sync.prototype.getEvent = function( path, callback ){

		this.request( 'GET', path, '', function( error, res ){

			if(error || res.statusCode !== 200){
				return callback('UNABLE TO RETRIEVE EVENT');
			}

			tools.parseEventData( res.body, function (err, result) {								
				callback( null, result );
			});

		});

	};

	Sync.prototype.login = function( callback ){

		this.request( 'OPTIONS', '', '', function( error, res ){

			if(error){
				callback(true);
			}
			else {
				callback(null, res.statusCode === 200);
			}

		});
		
	};

	Sync.prototype.getHome = function( callback ){

		this.request( 'PROPFIND', '', templates['getHome'](), function( error, res ){

			tools.parseXML( res.body, function( err, data ){

				if( err ){
					return callback( err );
				}

				callback(null, _.deepGet(data, 'response[0].propstat[0].prop[0].current-user-principal[0].href[0]'));

			});

		});
		
	};

	Sync.prototype.getCalendarHome = function( home, callback ){

		this.request( 'PROPFIND', home, templates['getCalendarHome'](), function( err, res ){

			tools.parseXML( res.body, function( err, data ){

				if( err ){
					return callback( err );
				}

				callback(null, _.deepGet(data, 'response[0].propstat[0].prop[0].calendar-home-set[0].href[0]'));

			});

		});

	};

	Sync.prototype.getEvents = function ( filter, path, callback ) {

		filter = filter || {};

		if(filter.date){

			if(filter.date.start){
				filter.date.start = tools.generateIcalTime(tools.generateUTCTime(new Date(filter.date.start))) + 'Z';
			}
			if(filter.date.end){
				filter.date.end = tools.generateIcalTime(tools.generateUTCTime(new Date(filter.date.end))) + 'Z';
			}
		}

		var body = templates['getEvents'](filter);
		body = body.replace(/^\s*$[\n\r]{1,}/gm, '');

		console.log(body);

		this.request('REPORT', path, body, function (err, res) {
			if (err) {
				callback(err);
				return;
			}

			tools.parseXML( res.body, function ( err, data ) {

				console.log(data);

				if (err) {
					return callback(err);
				}

				if(!data || !data.response){
					return callback(null, []);
				}

				async.map(data.response, function(internal, callback){

					var newObj = {};
					newObj.href = internal.href;
					newObj = _.extend(newObj, _.deepGet(internal, 'propstat[0].prop[0]'));
					newObj = _.reduce(newObj, tools.normalizeCalendarAttribute, {});

					tools.parseEventData(newObj['calendar-data'], function (err, result) {								
						newObj['calendar-data'] = result;
						callback( err, newObj );
					});

				}, callback);

			});

		});

	};

	Sync.prototype.modifyCalendar = function ( info, calendar, callback ) {

		var body = '<?xml version="1.0" encoding="UTF-8"?>\r\n';
		
		body += '<A:propertyupdate xmlns:A="DAV:">';
		body += '<A:set>';
		body += '<A:prop>';
		body += '<A:displayname>'+ info.name +'</A:displayname>'
		body += '</A:prop>';
		body += '</A:set>';
		body += '</A:propertyupdate>';

		this.request( 'PROPPATCH', calendar, body, function (err, res) {
			console.log(err);
		});

	};

	Sync.prototype.modifyEvent = function ( info, event, callback ) {

		if ( !info.time ) info.time = {};

		if ( !info.time.end ) {
			info.time.end = event.calendarData.dtend.date
		}

		if ( !info.time.start ) {
			info.time.start = event.calendarData.dtstart.date
		}

		if ( !info.name ){
			info.name = event.calendarData.calendarData.summary;
		}

		info.uuid	   = event.href.split('/')[3].split('.')[0];
		info.url 	   = event.href;

		this.generateEvent(info, callback);

	};

	Sync.prototype.request = function( type, path, body, callback ){

		var opts = {

			host    : this.config.host,
			path    : typeof path === 'string' ? path || '' : path.path || '',
			method  : type,
			data    : body,
			port    : this.config.port || 5232,
			headers : {

				'brief'           : 't',
				'accept-language' : 'es-es',
				'accept-encoding' : 'gzip, deflate',
				'connection'      : 'keep-alive',
				'user-agent'      : 'Inevio CalDAV Client',
	  			'prefer'          : 'return=minimal',
				'Accept'          : '*/*',
				'Content-Type'    : 'text/xml',
				'Content-Length'  : body.length,
				'Depth'           : path.depth || 0,
				'If-None-Match'   : '*',
				'Authorization'   : 'Basic ' + new Buffer( this.config.credentials.user + ':' + this.config.credentials.password ).toString('base64')

			}
		};	

		var self = this;

		tools.request( opts, this.config.secure, function( err, res ){
			
			if( err ){
				return callback( err );
			}else if( res.statusCode === 302 ){
				self.request( type, res.headers.location, body, callback );
			}else{
				callback( null, res );
			}


		});

	};

	module.exports = Sync;
