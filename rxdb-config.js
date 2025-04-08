module.exports = function (RED) {
    function RxDBConfigNode(config) {
        RED.nodes.createNode(this, config);
        this.mongoUrl = config.mongoUrl;
        this.dbName = config.dbName;
    }

    RED.nodes.registerType("rxdb-config", RxDBConfigNode);
};
