const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { Pact } = require("./node_modules/@pact-foundation/pact")
const TypedValueServiceClient = require('../TypedValueServiceClient');
const TypedValue = require('../TypedValue');

const expect = chai.expect;

const MOCK_SERVER_PORT = 1234;
const BASE_URL = 'http://localhost';
const SERVICE_URL = `${BASE_URL}:${MOCK_SERVER_PORT}`

const expectedBodyTypedValuesList = {
    posts: [
        {id: 1, typed: '01', value: 'CC', description: 'Cedula'},
        {id: 2, typed: '01', value: 'PS', description: 'Pasaporte'}
    ]
};

const expectedBodyTypedValueGet = {
    typedvalue: {id: 1, typed: '01', value: 'CC', description: 'Cedula'}
};

chai.use(chaiAsPromised);

describe("Pact", () => {
  const provider = new Pact({
      consumer: 'My Libraries Client',
      provider: 'My Libraries Provider',
      port: MOCK_SERVER_PORT,
      log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
      dir: path.resolve(process.cwd(), 'pacts'),
      logLevel: "INFO",
      spec: 2,
  });

  context("When there are a list of typed values", () => {
    describe("and there is a valid user session", () => {

      after(() => { return provider.finalize() });

      before(done => {
        provider
          .setup()
          .then(() => {
            return provider.addInteraction({
                state: 'Has two Typed Values',
                uponReceiving: 'a request for all typed values',
                withRequest: {
                    method: 'GET',
                    path: '/typedvalues',
                    headers: {'Accept': 'application/json'}
                },
                willRespondWith: {
                    status: 200,
                    headers: {'Content-Type': 'application/json'},
                    body: expectedBodyTypedValuesList
                }
            })
          .then(() => {
                provider.addInteraction({
                    state: 'Has one Typed Value',
                    uponReceiving: 'a request for one Typed Value',
                    withRequest: {
                        method: 'GET',
                        path: '/typedvalues/1',
                        headers: {'Accept': 'application/json'}
                    },
                    willRespondWith: {
                        status: 200,
                        headers: {'Content-Type': 'application/json'},
                        body: expectedBodyTypedValueGet
                    }
                }).then(() => done())
            });
          });
      });

      it('successfully receives all Typed Values', (done) => {
        const typedValueServiceClient = new TypedValueServiceClient(SERVICE_URL);
        const verificationPromise = typedValueServiceClient.getAllPosts();
        const expectedTypedValues = [
            TypedValue.fromJson(expectedBodyTypedValuesList.typedValues[0]),
            TypedValue.fromJson(expectedBodyTypedValuesList.typedValues[1])
        ];

        expect(verificationPromise).to.eventually.eql(expectedTypedValues).notify(done);
      });

      it('successfully receives one Typed Value', (done) => {
        const typedValueServiceClient = new TypedValueServiceClient(SERVICE_URL);
        const verificationPromise = typedValueServiceClient.getPostById(1);
        const expectedTypedValue = TypedValue.fromJson(expectedBodyTypedValueGet.typedValue);

        expect(verificationPromise).to.eventually.eql(expectedTypedValue).notify(done);
      });
    });
  });
});
