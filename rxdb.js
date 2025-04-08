const { createRxDatabase } = require('rxdb');
const { getRxStorageMongoDB } = require('rxdb/plugins/storage-mongodb');

module.exports = function (RED) {
    function RxDBNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        const configNode = RED.nodes.getNode(config.rxdbConfig);

        if (!configNode) {
            node.error("Missing RxDB config node");
            return;
        }

        async function init() {
            try {
                node.status({ fill: "yellow", shape: "dot", text: "Connecting..." });

                const storage = getRxStorageMongoDB({
                    connection: `${configNode.mongoUrl}/${configNode.dbName}`
                });


                const db = await createRxDatabase({
                    name: configNode.dbName,
                    storage
                });

                node.status({ fill: "green", shape: "dot", text: "Connected" });

                node.on('input', async function (msg) {
                    msg.payload = `[RxDB-Mongo Connected] ${msg.payload}`;
                    node.send(msg);
                });

            } catch (err) {
                node.status({ fill: "red", shape: "ring", text: "MongoDB error" });
                node.error("RxDB MongoDB Init Failed", err);
            }
        }

        init();
    }

    RED.nodes.registerType("rxdb", RxDBNode);
};
