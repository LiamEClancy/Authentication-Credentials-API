'use strict';

// Configure environment variables.
const result = require('dotenv').config();
if (result.error) {
	console.error(result.error);
}

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

// Pulling variables from the environment.
let auth0ClientID = process.env.AUTH0_CLIENT_ID;
let auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET;

// Lambda's entry-point to retrieve environment variables.
exports.handler = async (event) => {
	if (!auth0ClientID || !auth0ClientSecret) {
		response.statusCode = 500;
		response.body = JSON.stringify({ error: 'Invalid Auth0 credentials.' });
		return response;
	}
	return processRequest(event);
};

// Processing logic for responding to the call to this endpoint.
async function processRequest (event) {
	try {
		let eventBody = JSON.parse(event.body);
		let username = eventBody.username;
		let email = eventBody.email;
		let password = eventBody.password;

		// Get a production access token from Auth0.
		let options = {
			method: 'POST',
			url: 'https://arbitrary-json-storage.auth0.com/oauth/token',
			headers: {
				'content-type': 'application/json'
			},
			body: {
				grant_type: 'client_credentials',
				client_id: auth0ClientID,
				client_secret: auth0ClientSecret,
				audience: 'https://arbitrary-json-storage.auth0.com/api/v2/'
			},
			json: true
		};

		// Issue the request to retrieve the Auth0 production token.
		let body = await request(options);

		// Register a new user with Auth0.
		options = {
			method: 'POST',
			url: 'https://arbitrary-json-storage.auth0.com/api/v2/users',
			headers: {
				'content-type': 'application/json',
				'authorization': 'Bearer ' + body['access_token']
			},
			body: {
				user_id: '',
				connection: 'Username-Password-Authentication',
				email: email,
				username: username,
				password: password,
				user_metadata: {},
				blocked: false,
				email_verified: false,
				verify_email: false,
				app_metadata: {}
			},
			json: true
		};

		// Issue the request to register the new user.
		body = await request(options);

		// Return a response.
		response.statusCode = 200;
		response.body = JSON.stringify(body);
		return response;

	// If there was any error in connecting to Auth0, respond here.
	} catch (error) {
		response.statusCode = 500;
		response.body = JSON.stringify({
			error: error.stack
		});
		return response;
	}
};
