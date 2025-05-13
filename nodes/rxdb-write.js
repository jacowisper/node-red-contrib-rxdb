console.log('[rxdb] Loading write node...');

const { getRxDBInstance } = require('../lib/db');

module.exports = function (RED) {
    function RxDBWriteNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        getRxDBInstance().then(db => {
            node.status({ fill: "green", shape: "dot", text: "Mongo ready" });

            node.on('input', async (msg) => {
                const collectionName = msg?.rxdb?.collection;
                const payload = msg?.payload;

                if (!collectionName) {
                    node.error("Missing msg.rxdb.collection");
                    return;
                }

                if (!payload || (typeof payload !== 'object' && !Array.isArray(payload))) {
                    node.error("msg.payload must be an object or array of objects");
                    return;
                }

                const collection = db.collections[collectionName];
                if (!collection) {
                    node.error(`Collection '${collectionName}' does not exist`);
                    return;
                }

                try {
                    let result;

                    // Bulk upsert if array
                    if (Array.isArray(payload)) {
                        const insertedDocs = [];
                        for (const doc of payload) {
                            const res = await collection.incrementalUpsert(doc);
                            insertedDocs.push(res?.toJSON ? res.toJSON(false) : res);
                        }
                        result = { success: true, inserted: insertedDocs };
                        node.status({ fill: "green", shape: "dot", text: `Inserted ${insertedDocs.length}` });
                    } else {
                        const inserted = await collection.incrementalUpsert(payload);
                        const output = inserted?.toJSON ? inserted.toJSON(false) : inserted;
                        result = { success: true, inserted: output };
                        node.status({ fill: "green", shape: "dot", text: "Insert OK" });
                    }

                    msg.payload = result;
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
