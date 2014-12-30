var sync  = require('./index.js');

var con = new sync({
	host        : '127.0.0.1',
	port 		: 8888
	credentials : {
		user     : 'demo',
		password : 'demo'
	}
});

con.getHome( function( err, home ){

	if (err) {
		console.log(err);
		return;
	}

	con.getCalendarHome( home, function( err, calHome ){

		if (err) {
			console.log(err);
			return;
		}

		con.getCalendars( calHome, function( err, list ){
			
			if (err) {
				console.log(err);
				return;
			}

			for (var i = 0; i < list.length; i++) {
				console.log( list[i] );
			};

		});

	});
	
});

