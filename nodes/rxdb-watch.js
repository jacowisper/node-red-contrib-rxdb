console.log('[rxdb] Loading watch node...');

const { getRxDBInstance } = require('../lib/db');

module.exports = function (RED) {
    function RxDBWatchNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        let subscription;

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

                // Only subscribe once per trigger
                if (subscription) {
                    subscription.unsubscribe();
                }

                node.status({ fill: "blue", shape: "dot", text: `👀 Watching ${collectionName}` });

                subscription = collection.find().$.subscribe(changeEvent => {
                    if (!changeEvent) return;

                    node.send({
                        payload: changeEvent
                    });
                });
            });

            node.on('close', () => {
                if (subscription) {
                    subscription.unsubscribe();
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
