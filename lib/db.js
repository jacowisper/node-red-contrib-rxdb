const crypto = require('crypto');
const { createRxDatabase, addRxPlugin } = require('rxdb');
const { getRxStorageFoundationDB } = require('rxdb/plugins/storage-foundationdb');

// RxDB plugins
const { RxDBMigrationSchemaPlugin } = require('rxdb/plugins/migration-schema');
const { RxDBQueryBuilderPlugin } = require('rxdb/plugins/query-builder');
const { RxDBCleanupPlugin } = require('rxdb/plugins/cleanup');
const { RxDBLeaderElectionPlugin } = require('rxdb/plugins/leader-election');
const { replicateServer } = require('rxdb-server/plugins/replication-server');


addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBCleanupPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);

let rxdbInstancePromise = null;

function getRxDBInstance() {
    if (!rxdbInstancePromise) {
        rxdbInstancePromise = createRxDatabase({
            name: 'rxdb',
            storage: getRxStorageFoundationDB({ apiVersion: 720 }),
            multiInstance: true,
            allowSlowCount: true,
            hashFunction: async (data) => {
                return crypto.createHash('sha256').update(data).digest('hex');
            }
        });
    }

    return rxdbInstancePromise;
}

module.exports = { getRxDBInstance };

