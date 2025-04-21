console.log('[rxdb] Loading read node...');

const { getRxDBInstance } = require('../lib/db');

module.exports = function (RED) {
    function RxDBReadNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        getRxDBInstance().then(db => {
            node.status({ fill: "green", shape: "dot", text: "Foundation ready" });

            node.on('input', async (msg) => {
                if (!msg.rxdb || !(msg.rxdb.collection)) {
                    node.error("Missing msg.rxdb.collection");
                    return;
                }

                let limit = 0;
                let id = null;


                if (msg.rxdb.limit && !Number.isNaN(parseInt(msg.rxdb.limit))) {
                    limit = parseInt(msg.rxdb.limit);
                }

                if (msg.rxdb.id) {
                    id = msg.rxdb.id;
                }




                const collection = db.collections[msg.rxdb.collection];
                if (!collection) {
                    node.error(`Collection '${msg.rxdb.collection}' does not exist`);
                    return;
                }

                node.status({ fill: "yellow", shape: "dot", text: `Reading ${msg.rxdb.collection}` });
                let docs = [];

                if (msg.rxdb.count) {
                    if (id) {
                        const found = await collection.find().where('id').eq(id).exec();
                        docs = found.length;
                    } else if (msg.rxdb.selector) {
                        const found = await collection.find({ selector: msg.rxdb.selector }).exec();
                        docs = found.length;
                    } else {
                        docs = await collection.count().exec();
                    }
                } else {
                    if (msg.rxdb.selector) {
                        docs = await collection.find({ selector: msg.rxdb.selector }).limit(limit).exec();
                    } else if (id) {
                        docs = await collection.find().where('id').eq(id).limit(limit).exec();
                    } else {
                        docs = await collection.find().limit(limit).exec();
                    }
                }





                msg.payload = docs;

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
