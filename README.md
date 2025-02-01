# Octavia DB
- OctaviaDB - A lightweight, AES-encrypted NoSQL database for fast and secure local storage in Node.js.

# Features
- AES Encryption: Secure your data with robust AES encryption, ensuring privacy and safety for all stored information.
- NoSQL Architecture: A flexible, schema-less NoSQL database that allows for easy storage of diverse data structures.
- Auto-Commit: Automatically save changes at customizable intervals to prevent data loss and ensure consistent persistence.

# Installation
- To install the OctaviaDB module, run the following command in your terminal:
```bash
npm install octavia-db
```

# Example 1: Initialize Database
- This example shows how to initialize your database by specifying the database name, password, and auto-commit interval.

```js
const OctaviaDB = require('octavia-db');

// Initialize the OctaviaDB instance
const db = new OctaviaDB({
    database: './my-database',        // Path to your database directory
    password: 'my-secret-password',    // Password for encryption
    autoCommitInterval: 5000          // Auto commit changes every 5 seconds
});

// Get information about the database
console.log(db.info());

```

# Example 2: Work with Collections
- This example demonstrates how to create a collection, insert data, update data, and perform other operations like finding and removing data.

```js
const OctaviaDB = require('octavia-db');
const db = new OctaviaDB({
    database: './my-database',
    password: 'my-secret-password',
    autoCommitInterval: 5000
});

// Create a new collection
const collection = db.collection('users');

// Insert a single document
collection.insert({ id: 1, name: 'John Doe', age: 30 });
collection.insert({ id: 2, name: 'Jane Smith', age: 25 });

// Insert multiple documents
collection.insertMany([
    { id: 3, name: 'Michael Johnson', age: 35 },
    { id: 4, name: 'Sarah Lee', age: 40 }
]);

// Find a document by a query
const user = collection.find({ id: 1 });
console.log(user);  // Output: { id: 1, name: 'John Doe', age: 30 }

// Update a document
collection.update({ id: 1 }, { age: 31 });

// Remove a document
collection.remove({ id: 2 });

// Find multiple documents
const usersAbove30 = collection.findMany({ age: 30 });
console.log(usersAbove30);  // Output: [ { id: 1, name: 'John Doe', age: 31 }, { id: 3, name: 'Michael Johnson', age: 35 } ]

// Info about the collection
console.log(collection.info());
```

# Example 3: Work with Data Objects
- This example shows how to create and interact with a single data object that holds key-value pairs, similar to working with a JSON object.

```js
const OctaviaDB = require('octavia-db');
const db = new OctaviaDB({
    database: './my-database',
    password: 'my-secret-password',
    autoCommitInterval: 5000
});

// Create a new data object
const dataObject = db.dataObject('settings');

// Set key-value pairs in the data object
dataObject.set('theme', 'dark');
dataObject.set('notifications', true);
dataObject.set('language', 'en');

// Get values from the data object
console.log(dataObject.get('theme'));  // Output: 'dark'
console.log(dataObject.get('notifications'));  // Output: true
console.log(dataObject.get('language'));  // Output: 'en'

// Update a value in the data object
dataObject.set('theme', 'light');

// Remove value
dataObject.remove('language');

// Info about the data object
console.log(dataObject.info());  // Outputs stats on the data object (size, creation time, etc.)
```

# Example 4: Deleting Data
- This example demonstrates how to delete a collection or data object and even the entire database.

```js
const OctaviaDB = require('octavia-db');
const db = new OctaviaDB({
    database: './my-database',
    password: 'my-secret-password',
    autoCommitInterval: 5000
});

// Create a collection and insert data
const collection = db.collection('users');
collection.insert({ id: 1, name: 'John Doe', age: 30 });
collection.insert({ id: 2, name: 'Jane Smith', age: 25 });

// Delete a collection
collection.delete();

// Create a new data object
const dataObject = db.dataObject('settings');
dataObject.set('theme', 'dark');
dataObject.set('notifications', true);

// Delete a data object
dataObject.delete();

// Delete the entire database (be cautious with this!)
db.delete();
```

# Example 5: Check if Collection or Document Exists
- This example shows how to check whether a collection or document exists in the database before performing operations.

```js
const OctaviaDB = require('octavia-db');
const db = new OctaviaDB({
    database: './my-database',
    password: 'my-secret-password',
    autoCommitInterval: 5000
});

// Check if a collection exists
const collectionExists = db.collectionExists('users');
console.log(`Collection 'users' exists: ${collectionExists}`);  // Output: true/false

// Check if a data object exists
const dataObjectExists = db.documentExists('settings');
console.log(`Data Object 'settings' exists: ${dataObjectExists}`);  // Output: true/false
```

# OctaviaDB Methods
```js
// database methods
db.info() // Returns information about the database
db.delete() // Deletes the entire database
db.collection(collectionName, encrypt) //  Creates a new collection within the database.
db.dataObject(dataObjectName, encrypt) // Creates a new data object within the database.
db.collectionExists(collectionName) // Checks if a collection exists.
db.documentExists(documentName) // Checks if a document exists.

// collection methods.
collection.info() // information about collection
collection.delete() // delete collection
collection.insert(data, immediateCommit) // Inserts a new item into the collection.
collection.insertMany(dataArray, immediateCommit) // Inserts multiple items into the collection.
collection.find(query) // Finds a single item that matches the query.
collection.findMany(query) // Finds multiple items that match the query.
collection.update(query, newData, immediateCommit) // Updates an item in the collection.
collection.updateMany(query, newData, immediateCommit) // Updates multiple items in the collection.
collection.remove(query, immediateCommit) // Removes an item from the collection.
collection.removeMany(query, immediateCommit) // Removes multiple items from the collection.

// DataObject Methods
dataObj.set(key, value, immediateCommit) // Sets a key-value pair in the data object.
dataObj.get(key) // Retrieves a value from the data object.
dataObj.remove(key) // remove a value from the data object.
dataObj.info() // Returns information about the data object.
```