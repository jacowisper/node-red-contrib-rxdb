console.log('[rxdb] Loading read node...');

const { getRxDBInstance } = require('../lib/db');

module.exports = function (RED) {
    function RxDBReadNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        getRxDBInstance().then(db => {
            node.status({ fill: "green", shape: "dot", text: "Foundation ready" });

            node.on('input', async (msg) => {
                if (!msg.rxdb || !Array.isArray(msg.rxdb.collections)) {
                    node.error("msg.rxdb.collections must be a non-empty array");
                    return;
                }

                let limit = 0;
                if (msg.rxdb.limit && !Number.isNaN(parseInt(msg.rxdb.limit))) {
                    limit = parseInt(msg.rxdb.limit);
                }

                const result = {};

                for (const collectionName of msg.rxdb.collections) {
                    const collection = db.collections[collectionName];
                    if (!collection) {
                        node.error(`Collection '${collectionName}' does not exist`);
                        return;
                    }

                    node.status({ fill: "yellow", shape: "dot", text: `Reading ${collectionName}` });
                    const docs = await collection.find().limit(limit).exec();
                    result[collectionName] = docs;
                }

                msg.payload = result;
                node.send(msg);
                node.status({ fill: "green", shape: "dot", text: "Read complete" });
            });
        }).catch(err => {
            node.status({ fill: "red", shape: "ring", text: "DB Init failed" });
            node.error("RxDB init failed", err);
        });
    }

    RED.nodes.registerType("rxdb-read", RxDBReadNode);
};
