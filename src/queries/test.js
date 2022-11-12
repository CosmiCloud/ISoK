const DKGClient = require("dkg.js");
const OT_NODE_HOSTNAME = process.env.OT_NODE_HOSTNAME;
const OT_NODE_PORT = process.env.OT_NODE_PORT;
const node_options = {
  endpoint: OT_NODE_HOSTNAME,
  port: OT_NODE_PORT,
  useSSL: false,
  maxNumberOfRetries: 100,
};
const dkg = new DKGClient(node_options);

(async () => {
    try {
        var result = dkg.search({ query: 'ExecutiveAnvil', resultType: 'assertions' });
console.log(JSON.stringify(result));
    } catch (error) {
      console.error(error);
    }
  })();