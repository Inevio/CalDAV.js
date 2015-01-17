var async = require('async');
var tools = require('./tools.js');

var Sync = function( config ){
	this.config = config;
	this.protocol
};

Sync.prototype.createCalendar = function ( info, path, callback ) {

	var body = '';

	body += '<?xml version="1.0" encoding="UTF-8"?>\r\n';
	body += '<B:mkcalendar xmlns:B="urn:ietf:params:xml:ns:caldav">\r\n';
	body += '<A:set xmlns:A="DAV:">\r\n';
	body += '<A:prop>\r\n';
	body += '<D:calendar-color xmlns:D="http://apple.com/ns/ical/" symbolic-color="'+ info.color.name +'">'+ info.color.hex +'</D:calendar-color>\r\n';
	body += '<A:displayname>'+ info.name +'</A:displayname>\r\n';
	// MIRAR ESTE ATRIBUTO 
	body += '<D:calendar-order xmlns:D="http://apple.com/ns/ical/">7</D:calendar-order>\r\n';
	body += '<B:calendar-free-busy-set>	<YES/> </B:calendar-free-busy-set>\r\n';
	body += '<B:calendar-timezone>\r\n';
		//PROPIEDADES DE LA TIMEZONE
		body += 'BEGIN:VCALENDAR;\r\n';
		body += 'VERSION:2.0;\r\n';
		body += 'PRODID:-//Inevio//NONSGML Inevio Calendar//EN;\r\n';
		body += 'CALSCALE:GREGORIAN;\r\n';
		body += 'BEGIN:VTIMEZONE;\r\n';
		body += 'TZID:Europe/Madrid;\r\n';
		body += 'BEGIN:DAYLIGHT;\r\n';
		body += 'TZOFFSETFROM:+0100;\r\n';
		body += 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU;\r\n';
        body += 'DTSTART:19810329T020000;\r\n';
        body += 'TZNAME:CEST;\r\n';
        body += 'TZOFFSETTO:+0200;\r\n';
        body += 'END:DAYLIGHT;\r\n';
        body += 'BEGIN:STANDARD;\r\n';
        body += 'TZOFFSETFROM:+0200;\r\n';
        body += 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU;\r\n';
        body += 'DTSTART:19961027T030000;\r\n';
        body += 'TZNAME:CET;\r\n';
        body += 'TZOFFSETTO:+0100;\r\n';
        body += 'END:STANDARD;\r\n';
        body += 'END:VTIMEZONE;\r\n';
        body += 'END:VCALENDAR;\r\n';
    body += '</B:calendar-timezone>\r\n';
    body += '<B:supported-calendar-component-set>\r\n';
    body += '<B:comp name="VEVENT"/>\r\n';
    body += '</B:supported-calendar-component-set>\r\n';
    body += '</A:prop>\r\n';
    body += '</A:set>\r\n';
	body += '</B:mkcalendar>\r\n';

	this.request('MKCOL', path + '/' + tools.uuid() + '/', body, function (err, res) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, path + '/' + tools.uuid() + '/');
	});

};

Sync.prototype.createEvent = function ( info, calendar, callback ) {

	info.uuid 	  = tools.uuid();
	info.url      = calendar + info.uuid + '.ics';

	this.generateEvent(info, callback);

};

Sync.prototype.generateEvent = function ( info, callback ) {

	var body = "";

	body += 'BEGIN:VCALENDAR\r\n';
	body += 'VERSION:2.0\r\n';
	body += 'PRODID:-//Apple Inc.//Mac OS X 10.10.1//EN\r\n';
	body += 'CALSCALE:GREGORIAN\r\n';
	body += 'BEGIN:VTIMEZONE\r\n';
	body += 'TZID:Europe/Madrid\r\n';
	body += 'BEGIN:DAYLIGHT\r\n';
	body += 'TZOFFSETFROM:+0100\r\n';
	body += 'DTSTART:19810329T020000\r\n';
	body += 'TZNAME:CEST\r\n';
	body += 'TZOFFSETTO:+0200\r\n';
	body += 'END:DAYLIGHT\r\n';
	body += 'BEGIN:STANDARD\r\n';
	body += 'TZOFFSETFROM:+0200\r\n';
	body += 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\r\n';
	body += 'DTSTART:19961027T030000\r\n';
	body += 'TZNAME:CET\r\n';
	body += 'TZOFFSETTO:+0100\r\n';
	body += 'END:STANDARD\r\n';
	body += 'END:VTIMEZONE\r\n';
	body += 'BEGIN:VEVENT\r\n';
	body += 'CREATED:' + tools.generateIcalTime( new Date( Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), new Date().getUTCHours(), new Date().getUTCMinutes(), new Date().getUTCSeconds(), new Date().getUTCMilliseconds()) ) ) +'Z\r\n';
	body += 'UID:' + info.uuid + '\r\n';
	body += 'DTEND;TZID=Europe/Madrid:'+  tools.generateIcalTime(info.time.end) +'\r\n';
	body += 'TRANSP:OPAQUE\r\n';
	body += 'SUMMARY:' + info.name + '\r\n';
	body += 'DTSTART;TZID=Europe/Madrid:'+ tools.generateIcalTime(info.time.start) +'\r\n';
	body += 'DTSTAMP:'+ tools.generateIcalTime( new Date( Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), new Date().getUTCHours(), new Date().getUTCMinutes(), new Date().getUTCSeconds(), new Date().getUTCMilliseconds()) ) ) +'Z\r\n';
	body += 'SEQUENCE:0\r\n';
	body += 'END:VEVENT\r\n';
	body += 'END:VCALENDAR\r\n';

	this.request( 'PUT', info.url, body, function (err, res) {
		if (err) {
			cosole.log(err);
			return;
		}

		callback(null, info.url);
	});

};

Sync.prototype.deleteCalendar = function ( calendar, callback ) {

	this.request('DELETE', calendar, '', function (err, res) {
		callback(err);
	});

};

Sync.prototype.deleteEvent = function ( event, callback ) {

	this.request('DELETE', event, '', function (err, res) {
		callback(err);
	});

};

Sync.prototype.getCalendars = function( calHome, callback ){

	var body = '';

	body += '<?xml version="1.0" encoding="UTF-8"?>';
	body += '<A:propfind xmlns:A="DAV:">';
	body += '<A:prop>';
	body += '<A:add-member/>';
	body += '<C:allowed-sharing-modes xmlns:C="http://calendarserver.org/ns/"/>';
	body += '<D:autoprovisioned xmlns:D="http://apple.com/ns/ical/"/>';
	body += '<E:bulk-requests xmlns:E="http://me.com/_namespace/"/>';
	body += '<D:calendar-color xmlns:D="http://apple.com/ns/ical/"/>';
	body += '<B:calendar-description xmlns:B="urn:ietf:params:xml:ns:caldav"/>';
	body += '<B:calendar-free-busy-set xmlns:B="urn:ietf:params:xml:ns:caldav"/>';
	body += '<D:calendar-order xmlns:D="http://apple.com/ns/ical/"/>';
	body += '<B:calendar-timezone xmlns:B="urn:ietf:params:xml:ns:caldav"/>';
	body += '<A:current-user-privilege-set/>';
	body += '<B:default-alarm-vevent-date xmlns:B="urn:ietf:params:xml:ns:caldav"/>';
	body += '<B:default-alarm-vevent-datetime xmlns:B="urn:ietf:params:xml:ns:caldav"/>';
	body += '<A:displayname/>';
	body += '<C:getctag xmlns:C="http://calendarserver.org/ns/"/>';
	body += '<C:invite xmlns:C="http://calendarserver.org/ns/"/>';
	body += '<D:language-code xmlns:D="http://apple.com/ns/ical/"/>';
	body += '<D:location-code xmlns:D="http://apple.com/ns/ical/"/>';
	body += '<A:owner/>';
	body += '<C:pre-publish-url xmlns:C="http://calendarserver.org/ns/"/>';
	body += '<C:publish-url xmlns:C="http://calendarserver.org/ns/"/>';
	body += '<C:push-transports xmlns:C="http://calendarserver.org/ns/"/>';
	body += '<C:pushkey xmlns:C="http://calendarserver.org/ns/"/>';
	body += '<A:quota-available-bytes/>';
	body += '<A:quota-used-bytes/>';
	body += '<D:refreshrate xmlns:D="http://apple.com/ns/ical/"/>';
	body += '<A:resource-id/>';
	body += '<A:resourcetype/>';
	body += '<B:schedule-default-calendar-URL xmlns:B="urn:ietf:params:xml:ns:caldav"/>';
	body += '<C:source xmlns:C="http://calendarserver.org/ns/"/>';
	body += '<C:subscribed-strip-alarms xmlns:C="http://calendarserver.org/ns/"/>';
	body += '<C:subscribed-strip-attachments xmlns:C="http://calendarserver.org/ns/"/>';
	body += '<C:subscribed-strip-todos xmlns:C="http://calendarserver.org/ns/"/>';
	body += '<B:supported-calendar-component-set xmlns:B="urn:ietf:params:xml:ns:caldav"/>';
	body += '<B:supported-calendar-component-sets xmlns:B="urn:ietf:params:xml:ns:caldav"/>';
	body += '<A:supported-report-set/>';
	body += '<A:sync-token/>';
	body += '</A:prop>';
	body += '</A:propfind>';

	this.request( 'PROPFIND', calHome, body, function( error, res ){

		console.log(res.body);

		tools.parseXML( res.body, function ( err, data ){

			if( err ){
				return callback( err );
			}

			tools.find( data, [ 'multistatus', 'response' ], function( error, data ){

				console.log( error );

				if( error ){
					return callback( error );
				}

				async.map(

					data,
					function( data, callback ){
						
						var calendar = {};

						async.series([

							// Ruta al calendario
							function( callback ){

								tools.find( data, [ 'href', 0 ], function( error, value ){

									console.log(error);

									calendar.href = value;

									callback( error );

								});

							},

							// Sacamos el listado de atributos
							function( callback ){

								tools.find( data, [ 'propstat', 0, 'prop', 0 ], function( error, data ){

									console.log(error);

									var niceName;

									for( var i in data ){

										niceName 	         = i.split(':')[ 1 ];
										calendar[ niceName ] = data[ i ][ 0 ];

										tools.normalizeCalendarAttribute( calendar, niceName );

									}

									callback( error );

								});

							}

						], function( error ){
							
							if( error ){
								callback( error );
							}else{
								callback( null, calendar );
							}

						});

					},
					function( error, list ){
						callback( error, list );
					}

				);

			});

		});

	});

};

Sync.prototype.getHome = function( callback ){

	var body = [

		'<?xml version="1.0" encoding="UTF-8"?>',
		'<d:propfind xmlns:d="DAV:">',
  		'	<d:prop>',
     	'		<d:current-user-principal />',
  		'	</d:prop>',
		'</d:propfind>'

	];

	this.request( 'PROPFIND', '', body.join(''), function( error, res ){

		console.log( res.body );

		tools.parseXML( res.body, function( err, data ){

			if( err ){
				return callback( err );
			}

			tools.find(

				data,
				[ 'multistatus', 'response',  0 , 'propstat',  0 , 'prop',  0 , 'current-user-principal',  0 , 'href',  0 ],
				//[ 'd:multistatus', 'd:response',  0 , 'd:propstat',  0 , 'd:prop',  0 , 'd:current-user-principal',  0 , 'd:href',  0 ],
				callback

			);

		});

	});
	
};

Sync.prototype.getCalendarHome = function( home, callback ){

	var body = '';

	body += '<?xml version="1.0" encoding="UTF-8"?>';
	body += '<A:propfind xmlns:A="DAV:">';
	body += '<A:prop>';
	body += '<A:calendar-home-set/>';
	body += '</A:prop>';
	body += '</A:propfind>';

	this.request( 'PROPFIND', home, body, function( err, res ){

		console.log( res.body );

		tools.parseXML( res.body, function( err, data ){

			if( err ){
				return callback( err );
			}

			tools.find(

				data,
				[ 'multistatus', 'response', 0, 'propstat', 0, 'prop', 0, 'calendar-home-set', 0, 'href', 0 ],
				//[ 'd:multistatus', 'd:response', 0, 'd:propstat', 0, 'd:prop', 0, 'cal:calendar-home-set', 0, 'd:href', 0 ],
				callback

			);

		});

	});

};

Sync.prototype.listCalendarEvents = function ( calendar, callback ) {

	var body = '<?xml version="1.0" encoding="UTF-8"?>';

	body += '<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">';
	body += '<d:prop>';
	body += '<d:getetag/>';
	body += '<c:calendar-data />'
	body += '</d:prop>';
	body += '<c:filter>';
	body += '<c:comp-filter name="VCALENDAR">';
	body += '<c:comp-filter name="VTODO" />';
	body += '</c:comp-filter>';
	body += '</c:filter>';
	body += '</c:calendar-query>'

	this.request('REPORT', calendar, body, function (err, res) {
		if (err) {
			callback(err);
			return;
		}

		tools.parseXML( res.body, function ( err, data ) {

			if (err) {
				return callback(err);
			}

			tools.find( data, [ 'd:multistatus', 'd:response' ], function ( error, data ){

				if( error ){
					return callback( error );
				}

				async.map(data, function (data, callback) {

					var event = {};

					async.series([

						// Ruta al calendario
						function( callback ){
							tools.find( data, [ 'd:href', 0 ], function( error, value ){
								event.href = value;
								callback( error );
							});
						},

						// Sacamos el listado de atributos
						function( callback ){

							tools.find( data, [ 'd:propstat', 0, 'd:prop', 0 ], function ( error, data ){

								var niceName;

								for( var i in data ){
									niceName 	      = i.split(':')[ 1 ];
									event[ (niceName === 'calendar-data') ? 'calendarData' : niceName ] = data[ i ][ 0 ];

									tools.normalizeCalendarAttribute( event, niceName );
								}

								callback( error );

							});

						}

					], function( error ){
						
						if( error ){
							callback( error );
						}else{

							tools.parseEventData( event.calendarData, function (err, result) {								
								event.calendarData = result;
								callback( null, event );
							});
							
						}

					});

				}, function ( error, list ) {
					callback(error, list);
				});

			});

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
		path    : path || '',
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
			'Depth'           : 0,
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
