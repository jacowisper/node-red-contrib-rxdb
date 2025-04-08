# node-red-contrib-rxdb

> 🧪 A custom Node-RED node that connects to [RxDB](https://rxdb.info/) using a MongoDB backend.

**⚠️ Work In Progress** — This project is currently in early development and actively evolving. Contributions, feedback, and testing are welcome!

---

## 🚀 Overview

This Node-RED node allows you to:

- Connect to an RxDB instance backed by MongoDB
- Share a connection using a reusable config node
- Prepare for schema-based collections, inserts, queries, and sync
- Integrate RxDB logic directly into your Node-RED flows

---

## 📦 Features

- 🧩 Config node (`rxdb-config`) stores MongoDB connection settings
- ⚙️ Main node (`rxdb`) sets up the RxDB database
- 🔌 Designed for future expansion (collections, sync, CRUD, etc.)

---

## 🛠 Installation

Clone this repo and install it into your Node-RED environment:

```bash
cd ~/.node-red
npm install https://github.com/jacowisper/node-red-contrib-rxdb
```

Then restart Node-RED:

```bash
node-red-stop
node-red-start
```

---

## 🔧 Usage

1. Drag the `rxdb` node into your flow
2. Create an `rxdb-config` with:
   - MongoDB connection URL (e.g., `mongodb://localhost:27017`)
   - Database name (e.g., `my_rxdb`)
3. Deploy the flow and watch the connection status

The node currently outputs a test message to confirm MongoDB + RxDB are connected.

---

## 📚 Planned Features

- Schema-based collection definitions
- Flow-controlled insert/find/update/delete
- RxDB multi-instance and live change streaming
- Sync support with CouchDB/GraphQL
- Persistent storage of schema definitions

---

## 💬 Development Notes

This project is being built live by [@jacowisper](https://github.com/jacowisper) and is intended as a modular, production-ready base for RxDB integration in Node-RED.

Expect rapid iteration and frequent improvements.

---

## 🤝 Contributing

Pull requests, ideas, and issues are welcome!  
Start by opening an [Issue](https://github.com/jacowisper/node-red-contrib-rxdb/issues) or fork the repo.

---

## 📄 License

MIT © Jaco vd Walt
