console.log('[rxdb] Loading write node...');

const { getRxDBInstance } = require('../lib/db');

module.exports = function (RED) {
    function RxDBWriteNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        getRxDBInstance().then(db => {
            node.status({ fill: "green", shape: "dot", text: "Foundation ready" });

            node.on('input', async (msg) => {
                const collectionName = msg?.rxdb?.collection;
                const doc = msg?.payload;

                if (!collectionName) {
                    node.error("Missing msg.rxdb.collection");
                    return;
                }

                if (!doc || typeof doc !== 'object') {
                    node.error("msg.payload must be an object to insert");
                    return;
                }

                const collection = db.collections[collectionName];
                if (!collection) {
                    node.error(`Collection '${collectionName}' does not exist`);
                    return;
                }

                try {
                    const inserted = await collection.incrementalUpsert(doc);
                    node.status({ fill: "green", shape: "dot", text: "Insert OK" });
                    msg.payload = { success: true, inserted };
                    node.send(msg);
                } catch (err) {
                    node.status({ fill: "red", shape: "ring", text: "Insert failed" });
                    node.error("Insert error", err);
                }
            });
        }).catch(err => {
            node.status({ fill: "red", shape: "ring", text: "DB Init failed" });
            node.error("RxDB init failed", err);
        });
    }

    RED.nodes.registerType("rxdb-write", RxDBWriteNode);
};
