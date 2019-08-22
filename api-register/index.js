// Imports.
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });
const request = require('request-promise');

// Format of the response from this API call.
const response = {
	isBase64Encoded: false,
	statusCode: 200,
	headers: {
		'Access-Control-Allow-Origin': '*'
	}
};

// Lambda's entry-point to retrieve environment variables.
exports.handler = async (event) => {
	try {

		return processRequest(event);

	// If there was any error, respond here.
	} catch (error) {
		response.statusCode = 500;
		response.body = JSON.stringify({ error: error.stack });
		return response;
	}
};

// Processing logic for responding to the call to this endpoint.
async function processRequest (event) {
// Attempt to establish connection to the RDS instance.
	try {
		let connection = await mysql.createConnection({
			host: decryptedHost,
			user: decryptedUser,
			password: decryptedPassword,
			port: decryptedPort,
			database: decryptedDatabase,
			timeout: 30000
		});

// Construct the constants object.
		let constants = {
		};

// Return a response.
		response.statusCode = 200;
		response.body = JSON.stringify(constants);
		return response;
// If there was any error in connecting to RDS, respond here.
	} catch (error) {
		response.statusCode = 500;
		response.body = JSON.stringify({
			sql: sql,
			error: error.stack
		});
		connection.end();
		return response;
	}
};
