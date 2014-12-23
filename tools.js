
var _    = require('underscore');
var http = require('http');
var xml  = require('xml2js');
var uuid = require('node-uuid');

var Tools = function () {

	this.request = function( opts, callback ){

		var req = http.request( opts, function( res ){

			var buffer = '';

			res.on( 'data', function( data ){
				buffer += data;
			});

			res.on( 'end', function( data ){
				
				res.body = buffer;

				callback( null, res );

			});

		});

		req.write( opts.data );
		req.end();
	};

	this.parseXML = function( xmlString, callback ){
		xml.parseString( xmlString, callback );
	};

	this.cloneObject = function( obj ){
		return JSON.parse( JSON.stringify( obj ) );
	};

	this.find = function( obj, route, callback ){

		if( route.length > 1 ){

			// Case-insensitive way
			if(	typeof obj[ route[ 0 ] ] === 'undefined' ){

				var keys = Object.keys( obj );

				for( var i = 0; i < keys.length; i++ ){

					if( keys[ i ].toLowerCase() === route[ 0 ].toString().toLowerCase() ){
						return this.find( obj[ route[ 0 ] ], route.slice( 1 ), callback );
					}

				}

				return callback( 'ROUTE DOES NOT EXIST' );

			}

			this.find( obj[ route[ 0 ] ], route.slice( 1 ), callback );

		}else{
			callback( null, obj[ route[ 0 ] ] );
		}

	};

	this.uuid = function (string) {		
		return uuid.v4();
	};

	this.normalizeCalendarAttribute = function( calendar, name ){

		switch( name ){

			case 'calendar-color':

				calendar[ name ] = calendar[ name ]['_'].slice( 0, 7 );
				break;

			case 'calendar-order':
				calendar[ name ] = calendar[ name ]['_']
				break;

			case 'allowed-sharing-modes':
				
				calendar[ name ] = Object.keys( calendar[ name ] ).map( function( item ){
					return item.split(':')[ 1 ];
				});

				break;

			case 'owner':

				var clean = {};

				calendar[ name ] = Object.keys( calendar[ name ] ).forEach( function( item ){
					clean[ item.split(':')[ 1 ] ] = calendar[ name ][ item ][ 0 ];
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
					 
					list.push( keys[ 0 ].split(':')[ 1 ]);

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

				calendar[ name ] = Object.keys( calendar[ name ] ).map( function( item ){
					return item.split(':')[ 1 ];
				});

				break;

			case 'supported-calendar-component-set':

				var keys = Object.keys( calendar[ name ] );

				for( var i = 0; i < keys.length; i++ ){

					if( keys[ i ].toLowerCase() === 'cal:comp'.toLowerCase() ){
						calendar[ name ] = calendar[ name ][ keys[ i ] ][ 0 ]['$'];
						break;
					}

				}

				var keys = Object.keys( calendar[ name ] );

				for( var i = 0; i < keys.length; i++ ){

					if( keys[ i ].toLowerCase() === 'name'.toLowerCase() ){
						calendar[ name ] = calendar[ name ][ keys[ i ] ];
						break;
					}

				}

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

					return item.split(':')[ 1 ];

				});

				break;

		}

	};

};

module.exports = new Tools();