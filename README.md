# node-red-contrib-rxdb

 

A custom Node-RED node set for building low-code, reactive database flows using [RxDB](https://rxdb.info/) backed by **FoundationDB**.

---

## 🚀 Overview

This package includes Node-RED nodes that:

- Dynamically manage RxDB collections and schemas at runtime
- Support reading, writing, watching, and replicating changes
- Use FoundationDB 7.2 as a fast, durable backend
- Allow full flow-based control — no static schemas required!

---

## 📦 Included Nodes

| Node                   | Purpose                                       |
|------------------------|-----------------------------------------------|
| `rxdb-read`            | Query documents from one or more collections |
| `rxdb-write`           | Insert documents into a collection            |
| `rxdb-watch`           | Stream real-time changes from a collection   |
| `rxdb-add-collections` | Dynamically add collections + enable replication |

---

## 🧰 Prerequisites

To use this project with FoundationDB:

### ✅ 1. Install FoundationDB Client Libraries

```bash
sudo apt update
sudo apt install -y foundationdb-clients foundationdb-dev
```

### ✅ 2. Run a FoundationDB Server (API Version 7.2)

```bash
docker run -d \
  --name foundationdb \
  --hostname foundationdb \
  --restart unless-stopped \
  -v fdb-data:/var/lib/foundationdb/data \
  -v /opt/fdb-conf:/etc/foundationdb \
  -p 4500:4500 \
  foundationdb/foundationdb:7.2.5
```

Then copy the cluster file to your host system:

```bash
docker cp foundationdb:/var/fdb/fdb.cluster /opt/fdb-conf/fdb.cluster
sudo cp /opt/fdb-conf/fdb.cluster /etc/foundationdb/fdb.cluster
```

---

## 🛠 Installation

From local directory:

```bash
cd ~/.node-red
npm install /path/to/node-red-contrib-rxdb
```

Then restart Node-RED:

```bash
node-red-restart
```

---

## 🔧 Node Usage

### 🟢 `rxdb-read`

Reads one or more collections:

```json
{
  "rxdb": {
    "collections": ["calendarEvents"],
    "limit": 10
  }
}
```

### ✏️ `rxdb-write`

Writes a document to a collection:

```json
{
  "rxdb": { "collection": "tickets" },
  "payload": {
    "id": "t-001",
    "subject": "Test ticket"
  }
}
```

### 👀 `rxdb-watch`

Watches a collection for live updates:

```json
{
  "rxdb": { "collection": "calendarEvents" }
}
```

Output:
```json
{
  "payload": {
    "event": "INSERT",
    "doc": { ... }
  }
}
```

### 🛠️ `rxdb-add-collections`

Dynamically register collections:

```json
{
  "calendarEvents": {
    "schema": { ... },
    "replicate": true,
    "replicationUrl": "https://myhost/replCalendarEvents/0"
  }
}
```

---

## 📚 Features

- 🔁 FoundationDB 7.2 support via RxDB
- 🧩 Dynamic schema injection at runtime
- 📡 Replication support (RxDB replication-server plugin)
- 🧠 Smart instance caching (one shared RxDB connection)
- 🛠 No external DB config nodes — flow-driven logic only

---

 
---

## 📄 License

**UNLICENSED**  
No warranties. No attribution required. No restrictions.
