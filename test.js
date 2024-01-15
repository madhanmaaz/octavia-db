const { OctaviaDB } = require("./index")

const DB = new OctaviaDB({
    databaseName: "database",
    databasePassword: "mypassword"
})
console.log(DB.info())
const users = DB.collection("users", false)
console.log(users.info())
console.log(users.insert({ id: 1, name: "a", age: 20 }))
console.log(users.insertMany([{ id: 2, name: "b", age: 30 }, { id: 3, name: "b", age: 50 }, { id: 3, name: "basdasd", age: 50 }]))
console.log(users.find({ id: 2, name: "b" }))
console.log(users.findMany({}))
console.log(users.update({ id: 1 }, { name: "madhan" }));
console.log(users.updateMany({ id: 3 }, { name: "madhanmaaz" }));
console.log(users.remove({ id: 3 }))
console.log(users.removeMany({ id: 3 }))
console.log(users.delete())
console.log(DB.delete())