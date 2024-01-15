# Octavia DB

OctaviaDB is a lightweight Node.js module for creating encrypted collections of data on the filesystem. It provides basic CRUD (Create, Read, Update, Delete) operations for collections and supports encryption for data security.

## Authors
<a href="https://www.buymeacoffee.com/madhanmaazz" target="_blank"><img  align="right" src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>


- [@Madhanmaaz](https://www.github.com/madhanmaaz)

## Installation
To install the OctaviaDB module, run the following command in your terminal:
```bash
npm install octavia-db
```

## Features
- **Encryption:** OctaviaDB provides built-in encryption for your database to ensure data security.

- **CRUD Operations:** Perform Create, Read, Update, and Delete operations on collections.

- **Database Information:** Retrieve information about the database, collections, and file sizes.

## Getting Started
#### Create a new database with a name and password
```js
const myDatabase = new OctaviaDB({
	databaseName: 'myDatabase',
	databasePassword: 'mySecretPassword',
	logging: true // Set to false to disable logging
});
```

#### Create a collection. `databaseName.collection()`
```js
const userCollection = myDatabase.collection(
	'users', // collection name
	true  // encryption, default true
);
```

#### Insert data into the collection. `collectionName.insert()`
```js
const user1 = {
    username: 'john_doe',
    email: 'john.doe@example.com',
    age: 30
};

const result = userCollection.insert(user1);

if(result) {
	console.log(`inserted successfully`)
} else {
	console.log(`error while inserting the data`)
}
```

#### Insert multiple data objects into the collection. `collectionName.insertMany()`
```js
const multipleUserData = [
	{
		username: "patrick_williams",
		email: "patrick.williams@example.com",
		age: 25
  	},
	{
		username: "jane_smith",
		email: "jane.smith@example.com",
		age: 25
	},
	{
		username: "alex_johnson",
		email: "alex.johnson@example.com",
		age: 35
	},
	{
		username: 'john_doe',
		email: 'john.doe@example.com',
		age: 25
	}
];

const insertResult = userCollection.insertMany(multipleUserData);

if(insertResult) {
	console.log("success")
} else {
	console.log(`error while inserting the data`)
}
```

#### Find a user in the collection. `collectionName.find()`
```js
const foundUser = userCollection.find({ username: 'john_doe' });

if (foundUser) {
    console.log('Found User:', foundUser);
} else {
    console.log('User not found.');
}
```

#### Find many users in the collection. `collectionName.findMany()`
```js
const foundUser = userCollection.findMany({ age: 25 });

if (foundUser) {
    console.log('Found User:', foundUser);
} else {
    console.log('User not found.');
}
```

#### Update user information. `collectionName.update()`
```js
const updatedUserData = {
    age: 31,
    city: 'New York'
};

const updated = userCollection.update({ username: 'alex_johnson' }, updatedUserData);

if (updated) {
    console.log("success");
} else {
    console.log("failed");
}
```

#### Update many user information. `collectionName.updateMany()`
```js
const updatedUserData = {
    status: "active"
};

const updated = userCollection.updateMany({ age: 25 }, updatedUserData);

if (updated) {
    console.log("success");
} else {
    console.log("failed");
}
```

#### Remove a user from the collection. `collectionName.remove()`
```js
const removed = userCollection.remove({ username: 'alex_johnson' });

if (removed) {
    console.log("success");
} else {
    console.log("failed");
}
```

#### Remove many user from the collection. `collectionName.removeMany()`
```js
const removed = userCollection.removeMany({ username: 'john_doe' });

if (removed) {
    console.log("success");
} else {
    console.log("failed");
}
```

#### Get information about the collection. `collectionName.info()`
```js
const collectionInfo = userCollection.info();

if (collectionInfo) {
    console.log('Collection Information:', collectionInfo);
} else {
    console.log('Collection not found.');
}
```

#### Get information about the entire database. `databaseName.info()`
```js
const databaseInfo = myDatabase.info();

if (databaseInfo) {
    console.log('Database Information:', databaseInfo);
} else {
    console.log('Database not found.');
}
```

#### Delete the collection
```js
const isUserCollectionDeleted = userCollection.delete();

if (isUserCollectionDeleted) {
    console.log('Collection deleted successfully.');
} else {
    console.log('Error deleting collection.');
}
```

#### Delete the entire database
```js
const isDatabaseDeleted = myDatabase.delete();

if (isDatabaseDeleted) {
    console.log('Database deleted successfully.');
} else {
    console.log('Error deleting database.');
}
```