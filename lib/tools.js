
var _              = require('lodash');
var vDataParser    = require('vdata-parser');
var http           = require('http');
var https          = require('https');
var xml2js         = require('xml2js');
var uuid           = require('node-uuid');
var iCalDateParser = require('ical-date-parser');
var momentTimezone = require('moment-timezone');
_.mixin( require('lodash-deep') );

var parseOptions = {
	explicitRoot : false,
	normalizeTags : true,
	tagNameProcessors : [xml2js.processors.stripPrefix],
	//explicitArray : false
};

var Tools = function () {

	this.months = {
		'Jan': '01',
		'Feb': '02',
		'Mar': '03',
		'Apr': '04',
		'May': '05',
		'Jun': '06',
		'Jul': '07',
		'Aug': '08',
		'Sep': '09',
		'Oct': '10',
		'Nov': '11',
		'Dec': '12'
	}

	this.request = function( opts, secure, callback ){

		var protocol = secure ? https : http;

		var req = protocol.request( opts, function( res ){

			var buffer = '';

			res.on( 'data', function( data ){
				buffer += data;
			});

			res.on( 'end', function( data ){

				res.body = buffer;

				callback( null, res );

			});

		}).on( 'error', function( err ){
			console.log(err);
		});

		req.write( opts.data );
		req.end();
	};

	this.parseXML = function( xmlString, callback ){
		xml2js.parseString(xmlString, parseOptions,callback);
	};

	this.cloneObject = function( obj ){
		return JSON.parse( JSON.stringify( obj ) );
	};

	this.uuid = function (string) {
		return uuid.v4();
	};

	this.find = function(){};

	this.normalizeCalendarAttribute = function( result, value, key ){

		if(!value || !value[0] || !value[0] === 'undefined'){
			return result;
		}

		value = value[0];

		switch( key ){

			case 'resourcetype':

				value = Object.keys( value );
				break;

			case 'getctag':
				value = value.replace(/^"(.+(?="$))"$/, '$1');
				break;

		}

		result[key] = value;
		return result;

	};

	this.generateIcalTime = function (time) {

		var date = new Date(time).toString().split(' ');

		if(date.length < 5){
			return null;
		}

		return ( date[3] + this.months[date[1]] + date[2] + 'T' + date[4].split(':').join('') );

	};

	this.parseIcalTime = function(time){
		return time.slice(0,4) + '-' + time.slice(4,6) + '-' + time.slice(6,8) + ' ' + time.slice(9,11) + ':' + time.slice(11,13) + ':' + time.slice(13,15);
	};

	this.parseEventData = function (event) {

		event = vDataParser.fromString( event );

		var timeZone = event.VCALENDAR.VTIMEZONE.TZID;

		event.VCALENDAR.VEVENT.DTSTART = {

			TZID      : timeZone,
			VALUE     : event.VCALENDAR.VEVENT[ 'DTSTART;TZID=' + timeZone ],
			TIMESTAMP : ( new Date( momentTimezone.tz( this.parseIcalTime( event.VCALENDAR.VEVENT[ 'DTSTART;TZID=' + timeZone ] ), timeZone ).format() ) ).getTime()

		};

		event.VCALENDAR.VEVENT.DTEND = {

			TZID      : timeZone,
			VALUE     : event.VCALENDAR.VEVENT[ 'DTEND;TZID=' + timeZone ],
			TIMESTAMP : ( new Date( momentTimezone.tz( this.parseIcalTime( event.VCALENDAR.VEVENT[ 'DTEND;TZID=' + timeZone ] ), timeZone ).format() ) ).getTime()

		};

		delete event.VCALENDAR.VEVENT[ 'DTSTART;TZID=' + timeZone ];
		delete event.VCALENDAR.VEVENT[ 'DTEND;TZID=' + timeZone ];

		return event;

	};

	this.generateUTCTime = function(time){

		return new Date(Date.UTC(
		    time.getFullYear(),
		    time.getMonth(),
		    time.getDate(),
		    time.getHours(),
		    time.getMinutes()
		));
	}

};

module.exports = new Tools();
