
var _     = require('lodash');
_.mixin(require("lodash-deep"));
var http  = require('http');
var https = require('https');
var xml2js   = require('xml2js');
var uuid  = require('node-uuid');
var iCalDateParser = require('ical-date-parser');


var parseOptions = {
	explicitRoot : false,
	normalizeTags : true,
	tagNameProcessors : [xml2js.processors.stripPrefix],
	//explicitArray : false
}

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

			case 'allowed-sharing-modes':
				
				calendar[ name ] = Object.keys( calendar[ name ] ).map( function( item ){
					return item.split(':').slice( -1 )[ 0 ];
				});

				break;

			case 'owner':

				var clean = {};

				calendar[ name ] = Object.keys( calendar[ name ] ).forEach( function( item ){
					clean[ item.split(':').slice( -1 )[ 0 ] ] = calendar[ name ][ item ][ 0 ];
				});

				calendar[ name ] = clean;

				break;

			case 'current-user-privilege-set':

				var keys = Object.keys( calendar[ name ] );

				for( var i = 0; i < keys.length; i++ ){

					if( keys[ i ].toLowerCase() === 'd:privilege'.toLowerCase() ){
						calendar[ name ] = calendar[ name ][ keys[ i ] ];
						break;
					}

				}

				var list = [];

				for( var i in calendar[ name ] ){

					var keys = _.without( Object.keys( calendar[ name ][ i ] ), '$' );
					 
					list.push( keys[ 0 ].split(':').slice( -1 )[ 0 ]);

				}

				calendar[ name ] = list;

				break;

			case 'pre-publish-url':

				var keys = Object.keys( calendar[ name ] );

				for( var i = 0; i < keys.length; i++ ){

					if( keys[ i ].toLowerCase() === 'd:href'.toLowerCase() ){
						calendar[ name ] = calendar[ name ][ keys[ i ] ][ 0 ];
						break;
					}

				}

				break;

			case 'resourcetype':

				value = Object.keys( value );
				break;

			case 'supported-calendar-component-set':

				if(value) return result;
				value = _.deepPluck(value.comp, '$.name');
				break;

			case 'supported-report-set':

				var keys = Object.keys( calendar[ name ] );

				for( var i = 0; i < keys.length; i++ ){

					if( keys[ i ].toLowerCase() === 'd:supported-report'.toLowerCase() ){
						calendar[ name ] = calendar[ name ][ keys[ i ] ];
						break;
					}

				}

				calendar[ name ] = calendar[ name ].map( function( item ){

					var keys = Object.keys( item );

					for( var i = 0; i < keys.length; i++ ){

						if( keys[ i ].toLowerCase() === 'd:report'.toLowerCase() ){
							item = Object.keys( item[ keys[ i ] ][ 0 ] )[ 0 ];
							break;
						}

					}

					return item.split(':').slice( -1 )[ 0 ];

				});

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

	this.parseEventData = function (event) {

		event = event.replace(/\r/g, '');
		event = event.split('\n');
		event = event.filter(function(item){
			return item !== '';
		});

		var info = {};

		for (var i = 0; i < event.length - 1; i++) {

			event[i] = event[i].replace(/[\r\n]+/g, '').trim();

			try {	

				if ( event[i].split(':')[0].toLowerCase().indexOf(';') < 0) {
					info[ event[i].split(':')[0].toLowerCase() ] = ( event[i].split(':')[0].toLowerCase() === 'dtstamp') ? iCalDateParser( event[i].split(':')[1] ) : event[i].split(':')[1];
				} else {
					info[ event[i].split(';')[0].toLowerCase() ] = {};

					info[ event[i].split(';')[0].toLowerCase() ][ event[i].split(';')[1].split('=')[0].toLowerCase() ] =  event[i].split(';')[1].split('=')[1].split(':')[0];
					info[ event[i].split(';')[0].toLowerCase() ]['date'] = iCalDateParser( event[i].split(';')[1].split('=')[1].split(':')[1] + 'Z' )
				}

			} catch(e) {
				continue;
			}
		}

		return info;

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