const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { Pact, Matchers } = require('@pact-foundation/pact');
const TypedValueServiceClient = require('../src/TypedValueServiceClient');

const expect = chai.expect;

const MOCK_SERVER_PORT = 4321;
const MIN_TYPES_VALUES = 12;
const BASE_URL = 'http://localhost';
const SERVICE_URL = `${BASE_URL}:${MOCK_SERVER_PORT}`
const { somethingLike: like, eachLike } = Matchers;
const expectedBodyTyped = {id: like(1), type: like(1), value: like('CC'), description: like('Cedula')};
const expectedBodyTypedValuesList = eachLike(expectedBodyTyped, {
  min: MIN_TYPES_VALUES
});
const expectedBodyTypedValueGet = { typedValues: [{id: 13, type: 5, value: 'Cash', description: 'Cash'}] };

chai.use(chaiAsPromised);

describe("Pact", () => {
  let typedValueServiceClient;
  const provider = new Pact({
      consumer: 'My Libraries Client',
      provider: 'My Libraries Provider',
      port: MOCK_SERVER_PORT,
      log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
      dir: path.resolve(process.cwd(), 'pacts'),
      logLevel: "INFO",
      specification: 2,
  });

  before(async () => {
    typedValueServiceClient = new TypedValueServiceClient(SERVICE_URL);
  });

  context("When there are a list of typed values", () => {
    describe("and there is a valid user session", () => {

      after(() => { return provider.finalize() });

      before(done => {
        provider
          .setup()
          .then(() => {
            return provider.addInteraction({
                state: 'Has twelve (12) Typed Values',
                uponReceiving: 'a request for all typed values',
                withRequest: {
                    method: 'GET',
                    path: '/typedvalues',
                    headers: {'Accept': 'application/json'}
                },
                willRespondWith: {
                    status: 200,
                    headers: {'Content-Type': 'application/json'},
                    body: {typedValues: expectedBodyTypedValuesList}
                }
            })
          .then(() => {
                provider.addInteraction({
                    state: 'Has exactly one (1) Typed Value',
                    uponReceiving: 'a request for one Typed Value',
                    withRequest: {
                        method: 'GET',
                        path: '/typedvalues/5',
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

      it('successfully receives all Typed Values', async () => {
        const verificationPromise = await typedValueServiceClient.getAllTypedValues();
        expect(verificationPromise.length).to.equal(MIN_TYPES_VALUES);
      });

      it('successfully receives one Typed Value', async () => {
        const verificationPromise = await typedValueServiceClient.getTypedValueById(5);
        expect(verificationPromise[0]).to.have.property('value', 'Cash');
      });
    });
  });
});
