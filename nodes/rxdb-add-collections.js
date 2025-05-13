console.log('[rxdb] Loading add-collections node...');

const { getRxDBInstance } = require('../lib/db');
const { replicateServer } = require('rxdb-server/plugins/replication-server');
const { firstValueFrom } = require('rxjs');
const { filter } = require('rxjs/operators');

module.exports = function (RED) {
    function RxDBAddCollectionsNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        getRxDBInstance().then(db => {
            node.status({ fill: "green", shape: "dot", text: "Ready to add collections" });

            node.on('input', async (msg) => {
                const payload = msg?.payload;

                if (!payload || typeof payload !== 'object') {
                    node.error("msg.payload must be an object of { collectionName: { schema, replicate?, replicationUrl? } }");
                    return;
                }

                const collectionsToAdd = {};
                const added = [];
                const skipped = [];
                const replicated = [];
                const errors = [];

                for (const [name, config] of Object.entries(payload)) {
                    if (!config || typeof config !== 'object' || !config.schema || typeof config.schema !== 'object') {
                        node.warn(`Skipping collection '${name}': missing or invalid schema`);
                        continue;
                    }

                    if (db.collections[name]) {
                        skipped.push(name);
                        continue;
                    }

                    collectionsToAdd[name] = {
                        schema: config.schema,
                        autoMigrate: false,

                    };
                }

                try {
                    if (Object.keys(collectionsToAdd).length > 0) {
                        await db.addCollections(collectionsToAdd);
                        added.push(...Object.keys(collectionsToAdd));

                        for (const [name, config] of Object.entries(payload)) {
                            if (
                                config.replicate === true &&
                                db.collections[name]
                            ) {
                                if (!config.replicationUrl) {
                                    node.warn(`Collection '${name}' requested replication but no replicationUrl was provided`);
                                    continue;
                                }

                                try {



                                    const repstate = replicateServer({
                                        collection: db.collections[name],
                                        replicationIdentifier: `replication-${name}`,
                                        url: config.replicationUrl,
                                        push: {},
                                        pull: {},

                                        live: true
                                    });

                                    setInterval(() => repstate.reSync(), 60 * 1000);
                                    replicated.push(name);

                                    /* 
                                                                        repstate.active$.subscribe(isActive => {
                                                                            if (isActive) {
                                                                                node.status({
                                                                                    fill: "blue",
                                                                                    shape: "dot",
                                                                                    text: `🔁 Syncing: ${name}`
                                                                                });
                                                                            } else {
                                                                                node.status({
                                                                                    fill: "green",
                                                                                    shape: "dot",
                                                                                    text: `✔ Synced: ${name}`
                                                                                });
                                                                            }
                                                                        }); */

                                    /*   repstate.error$.subscribe(err => {
                                          node.status({
                                              fill: "red",
                                              shape: "ring",
                                              text: `❌ Error: ${name}`
                                          });
                                          node.warn(`Replication error in '${name}': ${err?.message}`);
                                          errors.push({ collection: name, error: err?.message });
                                      }); */

                                } catch (repErr) {
                                    node.warn(`Replication failed for '${name}': ${repErr.message}`);
                                    errors.push({ collection: name, error: repErr.message });
                                }

                            }
                        }
                    }
                    msg.payload = {
                        status: "ok",
                        added,
                        skipped,
                        replicated,
                        errors
                    };

                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: `✔ Added: ${added.length} | ⏭ Skipped: ${skipped.length} | 🔁 Repl: ${replicated.length}`
                    });

                    node.send(msg);
                } catch (err) {
                    node.status({ fill: "red", shape: "ring", text: "Add failed" });
                    node.error("Failed to add collections", err);
                    node.error(err);
                }
            });

        }).catch(err => {
            node.status({ fill: "red", shape: "ring", text: "Init failed" });
            node.error("RxDB init failed", err);
        });
    }

    RED.nodes.registerType("rxdb-add-collections", RxDBAddCollectionsNode);
};
