# Octavia DB
OctaviaDB is a lightweight Node.js module for creating encrypted collections of data on the filesystem and supports encryption for data security.

# Installation
To install the OctaviaDB module, run the following command in your terminal:
```bash
npm install octavia-db
```

# Features
- **Encryption**: OctaviaDB provides built-in encryption for your database to ensure data security.

- **Database Information**: Retrieve information about the database and collections

- **Schema Validation**: Validate data against predefined schemas to ensure data integrity and consistency.

# Methods
```js
// database methods
db.info()
db.delete()
db.collectionExists(collectionName)

// collection methods. `dataScheme` are optional
collection.info()
collection.delete()
collection.insert(dataObject, dataScheme)
collection.insertMany(arrayOfDataObjects, dataScheme)
collection.find(queryData)
collection.findMany(queryData)
collection.update(queryData, newData, dataScheme)
collection.updateMany(queryData, newData, dataScheme)
collection.remove(queryData)
collection.removeMany(queryData)
```

# Getting Started
#### Create a new database with a name and password
```js
const { OctaviaDB } = require("octavia-db")

const db = new OctaviaDB({
	database: 'myDatabase',
	password: 'mySecretPassword',
});
```
#### Create a collection. `db.Collection()`
```js
const userCollection = db.Collection(
	'users', // collection name
	true  // encryption, default true
);
```

#### Insert data into the collection. `collection.insert()`
```js
const user = {
    username: 'john_doe',
    email: 'john.doe@example.com',
    age: 30
};

try {
	userCollection.insert(user)
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```

#### Insert data into the collection. `collection.insert()` with data scheme
```js
const user = {
    username: 'john_doe',
    email: 'john.doe@example.com',
    age: 30,
	active: true,
	languages: [
		'c++',
		'c',
		'golang',
		'js'
	]
};

try {
	userCollection.insert(user, {
		username: String,
    	email: String,
    	age: Number,
		active: Boolean,
		languages: Array
	})
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```

#### Insert multiple data objects into the collection.`collection.insertMany()`
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

try {
	userCollection.insertMany(multipleUserData)
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```


#### Find a user in the collection. `collection.find()`
```js
try {
	const foundUser = userCollection.find({ username: 'john_doe' })
	console.log(result)
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```

#### Find many users in the collection. `collection.findMany()`
```js
try {
	const users = userCollection.findMany({ age: 25 })
	console.log(users);
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```

#### Update user information. `collection.update()`
```js
try {
	const updatedUserData = {
    	age: 31,
    	city: 'New York'
	};

	const updated = userCollection.update({ username: 'alex_johnson' }, updatedUserData)
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```

#### Update many user information. `collection.updateMany()`
```js
try {
	const updatedUserData = {
    	status: "go to work"
	};

	const updated = userCollection.updateMany({ age: 25 }, updatedUserData)
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```

#### Remove a user from the collection. `collection.remove()`
```js
try {
	const removed = userCollection.remove({ username: 'alex_johnson' })
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```

#### Remove many user from the collection. `collection.removeMany()`
```js
try {
	const removed = userCollection.removeMany({ age: 25 })
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```

#### Get information about the collection. `collection.info()`
```js
try {
	const collectionInfo = userCollection.info()
	console.log(collectionInfo)
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```

#### Get information about the entire database. `databaseName.info()`
```js
try {
	const databaseInfo = db.info()
	console.log(databaseInfo)
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```

#### Delete the collection. `collection.delete()`
```js
try {
	const response = userCollection.delete()
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```

#### Delete the entire database. `db.delete()`
```js
try {
	const response = db.delete()
} catch(error) {
	console.log("Code:", error.code)
	console.log("Message:", error.msg)
}
```

# Example 
```js
const { OctaviaDB } = require("octavia-db")

try {
    const DB = new OctaviaDB({
        database: "database",
        password: "mypassword"
    })

    const users = DB.Collection("users", false)

    const insert = users.insert({
        id: 1,
        username: "madhan",
        age: 20,
        records: { r1: 1, r2: 2 },
        languages: ["js", "c", "c++", "go", "php"],
        deep: {
            tags: {
                a: true,
                b: false
            },
            btns: {
                text: "click",
                className: "button",
                index: 0
            }
        }
    }, {
        id: Number,
        username: String,
        age: Number,
        records: Object,
        languages: Array,
        deep: {
            tags: {
                a: Boolean,
                b: Boolean
            },
            btns: {
                text: String,
                className: String,
                index: Number
            }
        }
    })

    console.log("[+] insert:", insert)

    const insertMany = users.insertMany([
        {
            id: 2,
            username: "madhan",
            age: 20,
            records: { r1: 1, r2: 2 },
            languages: ["js", "c", "c++", "go", "php"],
            deep: {
                tags: {
                    a: true,
                    b: false
                },
                btns: {
                    text: "click",
                    className: "button",
                    index: 0
                }
            }
        },
        {
            id: 3,
            username: "madhan",
            age: 25,
            records: { r1: 1, r2: 2 },
            languages: ["js", "c", "c++", "go", "php"],
            deep: {
                tags: {
                    a: true,
                    b: false
                },
                btns: {
                    text: "click",
                    className: "button",
                    index: 0
                }
            }
        }
    ], {
        id: Number,
        username: String,
        age: Number,
        records: Object,
        languages: Array,
        deep: {
            tags: {
                a: Boolean,
                b: Boolean
            },
            btns: {
                text: String,
                className: String,
                index: Number
            }
        }
    })

    console.log("[+] insertMany:", insertMany)

    const find = users.find({ age: 25 })
    console.log("[+] find:", find)

    const findMany = users.findMany({ age: 20 })
    console.log("[+] findMany:", findMany)

    const update = users.update({ age: 25 }, { status: "active" }, { status: String })
    console.log("[+] update:", update)

    const updateMany = users.updateMany({ age: 20 }, { status: "inActive" }, { status: String })
    console.log("[+] updateMany:", updateMany)

    const remove = users.remove({ age: 25 })
    console.log("[+] remove:", remove)

    const removeMany = users.removeMany({ age: 20 })
    console.log("[+] removeMany:", removeMany)

    console.log("[+] database information:", DB.info())
    console.log("[+] collection information:", users.info())

    const collectionDelete = users.delete()
    console.log("[+] collectionDelete:", collectionDelete)

    const databaseDelete = DB.delete()
    console.log("[+] databaseDelete:", databaseDelete)
} catch (error) {
    console.log("Message:", error.msg)
    console.log("Code:", error.code)
}
```