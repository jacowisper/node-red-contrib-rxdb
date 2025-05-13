console.log('[rxdb] Loading delete node...');

const { getRxDBInstance } = require('../lib/db');

module.exports = function (RED) {
    function RxDBDeleteNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        getRxDBInstance().then(db => {
            node.status({ fill: "green", shape: "dot", text: "Ready to delete" });

            node.on('input', async (msg) => {
                const collectionName = msg?.rxdb?.collection;
                const docId = msg?.payload?._id || msg?.payload?.id;

                if (!collectionName) {
                    node.error("Missing msg.rxdb.collection");
                    return;
                }

                if (!docId) {
                    node.error("Missing msg.payload._id or msg.payload.id for delete");
                    return;
                }

                const collection = db.collections[collectionName];
                if (!collection) {
                    node.error(`Collection '${collectionName}' does not exist`);
                    return;
                }

                try {
                    const doc = await collection.findOne(docId).exec();
                    if (!doc) {
                        node.status({ fill: "yellow", shape: "ring", text: "Document not found" });
                        msg.payload = { success: false, message: "Document not found", id: docId };
                        node.send(msg);
                        return;
                    }

                    await doc.remove();

                    node.status({ fill: "green", shape: "dot", text: "Delete OK" });
                    msg.payload = { success: true, deletedId: docId };
                    node.send(msg);
                } catch (err) {
                    node.status({ fill: "red", shape: "ring", text: "Delete failed" });
                    node.error("Delete error", err);
                }
            });
        }).catch(err => {
            node.status({ fill: "red", shape: "ring", text: "DB Init failed" });
            node.error("RxDB init failed", err);
        });
    }

    RED.nodes.registerType("rxdb-delete", RxDBDeleteNode);
};
