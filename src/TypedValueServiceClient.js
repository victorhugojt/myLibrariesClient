const request = require('request');
const TypedValue = require('./TypedValue');

class TypedValueServiceClient {

    constructor(endpoint) {
        console.log("Starting service : ", endpoint);
        this.endpoint = endpoint;
    }

    getAllTypedValues() {
        return new Promise((resolve, reject) => {

            const options = {
                url: this.endpoint + '/typedvalues',
                headers: {'Accept': 'application/json'}
            };

            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    const parsedBody = JSON.parse(body);
                    const result = parsedBody.typedValues.map((data) => TypedValue.fromJson(data));
                    resolve(result);
                } else {
                    reject(error);
                }
            });
        });
    }

    getTypedValueById(typedValueId) {
        return new Promise((resolve, reject) => {

            const options = {
                url: this.endpoint + '/typedvalues/' + typedValueId,
                headers: {'Accept': 'application/json'}
            };
            console.log(options);
            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    const parsedBody = JSON.parse(body);
                    console.log(parsedBody);
                    const result = parsedBody.typedValues.map((data) => TypedValue.fromJson(data));
                    resolve(result);
                } else {
                    reject(error);
                }
            });
        });
    }
}

module.exports = TypedValueServiceClient;
