// @ts-nocheck


console.log('[rxdb] Loading watch node...');

const { getRxDBInstance } = require('../lib/db');

module.exports = function (RED) {
    function RxDBWatchNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node._subscription = null;
        node._currentCollectionName = null;

        getRxDBInstance().then(db => {
            node.status({ fill: "grey", shape: "ring", text: "Waiting for collection" });

            node.on('input', (msg) => {
                const collectionName = msg?.rxdb?.collection;

                if (!collectionName) {
                    node.error("Missing msg.rxdb.collection");
                    return;
                }
                const collection = db.collections[collectionName];
                if (!collection) {
                    node.error(`Collection '${collectionName}' does not exist`);
                    return;
                }

                // Only resubscribe if collection name changed
                if (node._currentCollectionName === collectionName && node._subscription) {
                    node.log(`[RxDB] Already watching '${collectionName}', skipping re-subscribe.`);
                    return;
                }

                // Unsubscribe from any previous
                if (node._subscription) {
                    node._subscription.unsubscribe();
                    node.log(`[RxDB] Unsubscribed from '${node._currentCollectionName}'`);
                }

                node._subscription = collection.find().$.subscribe(changeEvent => {
                    if (!changeEvent) return;

                    let docData = null;

                    if (changeEvent.documentData) {
                        docData = changeEvent.documentData; // Already plain object
                    } else if (changeEvent.doc && typeof changeEvent.doc.toJSON === 'function') {
                        docData = changeEvent.doc.toJSON(false);
                    }

                    node.send({
                        payload: {
                            event: changeEvent.operation,
                            doc: docData,
                            id: changeEvent.id,
                            timestamp: changeEvent.startTime || Date.now()
                        },
                        collection: collectionName,
                        topic: 'rxdb-change'
                    });
                });



                node.log(`[RxDB] Subscribed to '${collectionName}'`);
            });

            node.on('close', () => {
                if (node._subscription) {
                    node._subscription.unsubscribe();
                    node.log(`[RxDB] Unsubscribed from '${node._currentCollectionName}' on node close.`);
                }
                node.status({ fill: "grey", shape: "ring", text: "Stopped" });
            });

        }).catch(err => {
            node.status({ fill: "red", shape: "ring", text: "DB Init failed" });
            node.error("RxDB init failed", err);
        });
    }

    RED.nodes.registerType("rxdb-watch", RxDBWatchNode);
};
