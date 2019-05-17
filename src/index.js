const TypedValueServiceClient = require('./TypedValueServiceClient');

const typedValueServiceClient = new TypedValueServiceClient('http://localhost:8081');

typedValueServiceClient.getTypedValues()
    .then((typedValues) => {
        console.log(typedValues);
    })
    .catch((error) => {
        console.log(error);
    })
;