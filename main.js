var sync  = require('./sync.js');

var con = new sync({

	host        : '127.0.0.1',
	credentials : {

		user     : 'demo',
		password : 'demo'

	}

});

con.getHome( function( err, home ){

	console.log( err, home );

	con.getCalendarHome( home, function( err, calHome ){

		con.getCalendars( calHome, function( err, list ){
			console.log( err, list );
		});

	});
	
});

