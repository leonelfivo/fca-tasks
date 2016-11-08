/*
* DEPENDENCES
*/
var OracleDB = require('oracledb');
var PropertiesReader = require('properties-reader');

var properties = PropertiesReader('./properties/properties.file');

var parameters = {
    user          : properties.get('db.connection.username'),
    password      : properties.get('db.connection.password'),
    connectString : properties.get('db.connection.url')
};

// Functions
exports.select = function(query, callback) {
	OracleDB.getConnection(
		parameters,  	
	  	function(err, connection) {
	    	
	    	if (err) { 
	    		console.error(err.message); 
	    		return null; 
	    	}

	    	connection.execute(
		      	query,
		      	[],
		      	function(err, result) {
		        	if (err) { 
		        		console.error(err.message); 
		        		return; 
		        	}	
		        	return callback(null,result.rows); // return result on success	        		        	
				}
		    );

	});
};

exports.getStream = function(query, callback) {

	OracleDB.getConnection(
		parameters,  	
	  	function(err, connection) {
	    	
	    	if (err) { 
	    		console.error(err.message); 
	    		return null; 
	    	}

	    	var stream = connection.queryStream(query);

			return callback(err,stream);
	});	
};