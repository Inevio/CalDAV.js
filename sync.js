
var async = require('async');
var tools = require('./tools.js');

var Sync = function( config ){

	this.config = config;

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

		tools.parseXML( res.body, function( err, data ){

			if( err ){
				return callback( err );
			}

			tools.find( data, [ 'd:multistatus', 'd:response' ], function( error, data ){

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

								tools.find( data, [ 'd:href', 0 ], function( error, value ){

									calendar.href = value;

									callback( error );

								});

							},

							// Sacamos el listado de atributos
							function( callback ){

								tools.find( data, [ 'd:propstat', 0, 'd:prop', 0 ], function( error, data ){

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

	var body = '';

	body += '<?xml version="1.0" encoding="UTF-8"?>';
	body += '<A:propfind xmlns:A="DAV:">';
	body += '<A:prop>';
	body += '<A:current-user-principal/>';
	body += '<A:principal-collection-set/>';
	body += '</A:prop>';
	body += '</A:propfind>';

	this.request( 'PROPFIND', '', body, function( error, res ){

		tools.parseXML( res.body, function( err, data ){

			if( err ){
				return callback( err );
			}

			tools.find(

				data,
				[ 'd:multistatus', 'd:response',  0 , 'd:propstat',  0 , 'd:prop',  0 , 'd:current-user-principal',  0 , 'd:href',  0 ],
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

		tools.parseXML( res.body, function( err, data ){

			if( err ){
				return callback( err );
			}

			tools.find(

				data,
				[ 'd:multistatus', 'd:response', 0, 'd:propstat', 0, 'd:prop', 0, 'cal:calendar-home-set', 0, 'd:href', 0 ],
				callback

			);

		});

	});

};

Sync.prototype.createCalendar = function ( info, callback ) {

	var body = '';

	body += '<?xml version="1.0" encoding="UTF-8"?>';
	body += '<B:mkcalendar xmlns:B="urn:ietf:params:xml:ns:caldav">';
	body += '<A:set xmlns:A="DAV:">';
	body += '<A:prop>';
	body += '<D:calendar-color xmlns:D="http://apple.com/ns/ical/" symbolic-color="'+ info.color.name +'">'+ info.color.hex +'</D:calendar-color>'
	body += '<A:displayname>'+ info.name +'</A:displayname>';
	// MIRAR ESTE ATRIBUTO 
	body += '<D:calendar-order xmlns:D="http://apple.com/ns/ical/">7</D:calendar-order>';
	body += '<B:calendar-free-busy-set>	<YES/> </B:calendar-free-busy-set>';
	body += '<B:calendar-timezone>';
		//PROPIEDADES DE LA TIMEZONE
		body += 'BEGIN:VCALENDAR&#13;';
		body += 'VERSION:2.0&#13;';
		body += 'PRODID:-//Apple Inc.//Mac OS X 10.10.1//EN&#13;';
		body += 'CALSCALE:GREGORIAN&#13;';
		body += 'BEGIN:VTIMEZONE&#13;';
		body += 'TZID:Europe/Madrid&#13;';
		body += 'BEGIN:DAYLIGHT&#13;';
		body += 'TZOFFSETFROM:+0100&#13;';
		body += 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU&#13;';
        body += 'DTSTART:19810329T020000&#13;';
        body += 'TZNAME:CEST&#13;';
        body += 'TZOFFSETTO:+0200&#13;';
        body += 'END:DAYLIGHT&#13;';
        body += 'BEGIN:STANDARD&#13;';
        body += 'TZOFFSETFROM:+0200&#13;';
        body += 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU&#13;';
        body += 'DTSTART:19961027T030000&#13;';
        body += 'TZNAME:CET&#13;';
        body += 'TZOFFSETTO:+0100&#13;';
        body += 'END:STANDARD&#13;';
        body += 'END:VTIMEZONE&#13;';
        body += 'END:VCALENDAR&#13;';
    body += '</B:calendar-timezone>';
    body += '<B:supported-calendar-component-set>';
    body += '<B:comp name="VEVENT"/>';
    body += '</B:supported-calendar-component-set>';
    body += '</A:prop>';
    body += '</A:set>'
	body += '</B:mkcalendar>';

	this.request('MKCOL', info.path + tools.uuid(), body, function (err, res) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, res);
	});

};

Sync.prototype.request = function( type, path, body, callback ){

	var opts = {

		host    : this.config.host,
		path    : path || '',
		method  : type,
		data    : body,
		port    : this.config.port || 8888,
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

	tools.request( opts, function( err, res ){
		
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
