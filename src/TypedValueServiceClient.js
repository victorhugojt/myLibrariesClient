const request = require('request');
const TypedValue = require('./TypedValue');

class TypedValueServiceClient {

    constructor(endpoint) {
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
                    const result = parsedBody.typesValues.map((data) => TypedValue.fromJson(data));

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

            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    const parsedBody = JSON.parse(body);
                    const result = TypedValue.fromJson(parsedBody.typedValue);

                    resolve(result);
                } else {
                    reject(error);
                }
            });
        });
    }
}


module.exports = TypedValueServiceClient;
