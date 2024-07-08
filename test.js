const { OctaviaDB } = require("./index")

const DB = new OctaviaDB({
    database: "database",
    password: "mypassword"
})

try {
    const users = DB.Collection("users", false)

    const insert = users.insert({
        id: 1,
        username: "madhan",
        age: 20,
        records: {},
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
            records: {},
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
            records: {},
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