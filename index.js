const fs = require("fs")
const path = require("path")
const crypto = require('crypto')


class OctaviaDB {
    constructor({ databaseName, databasePassword }) {
        this.databaseName = databaseName
        this.databasePassword = databasePassword
        this.#createDatabase()
    }

    // private 
    #createDatabase() {
        try {
            if (!fs.existsSync(this.databaseName)) {
                fs.mkdirSync(this.databaseName, { recursive: true })
            }
        } catch (error) {
            this.#logger(error.message, 1)
            process.exit(1)
        }
    }

    #logger(data, type) {
        let value = `[OCTAVIA LOG] ${data}`
        if (type) {
            value = `[OCTAVIA ERROR] ${data}`
        }
        console.log(value)
    }

    // encription
    #generateSalt() {
        try {
            return crypto.randomBytes(16).toString('hex')
        } catch (error) {
            this.#logger(error.message, 1)
        }
    }

    #bufferKey(salt) {
        try {
            return crypto.pbkdf2Sync(this.databasePassword, salt, 10000, 32, 'sha256')
        } catch (error) {
            this.#logger(error.message, 1)
        }
    };

    #encrypt(data) {
        try {
            const salt = this.#generateSalt()
            const key = this.#bufferKey(salt)
            const iv = crypto.randomBytes(16)
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
            let encryptedData = cipher.update(JSON.stringify(data), 'utf-8', 'hex')
            encryptedData += cipher.final('hex')
            return JSON.stringify({ encryptedData, salt, iv: iv.toString('hex') })
        } catch (error) {
            this.#logger(error.message, 1)
        }
    }

    #decrypt(data, salt, iv) {
        try {
            const key = this.#bufferKey(salt)
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'))
            let decryptedData = decipher.update(data, 'hex', 'utf-8')
            decryptedData += decipher.final('utf-8')
            return JSON.parse(decryptedData)
        } catch (error) {
            if (error.code == 'ERR_OSSL_BAD_DECRYPT') {
                this.#logger("incorrect database password.", 1)
            } else {
                this.#logger(error.message, 1)
            }
        }
    }

    // public
    Collection(collectionName) {
        const collectionPath = path.join(this.databaseName, collectionName)
        const collectionOptions = {
            create: (data) => {
                data = data == undefined ? {} : data
                try {
                    if (!fs.existsSync(collectionPath)) {
                        fs.writeFileSync(collectionPath, this.#encrypt(data), { encoding: "utf-8" })
                        return true
                    }
                    return "collection already found"
                } catch (error) {
                    this.#logger(error.message, 1)
                    return false
                }
            },
            read: () => {
                try {
                    const readData = JSON.parse(fs.readFileSync(collectionPath, { encoding: "utf-8" }))
                    return this.#decrypt(readData.encryptedData, readData.salt, readData.iv)
                } catch (error) {
                    if (error.code == "ENOENT") {
                        this.#logger('collection not found.', 1)
                    } else {
                        this.#logger(error.message, 1)
                    }
                }
            },
            update: (dataObject) => {
                try {
                    const data = collectionOptions.read()
                    for (const key in dataObject) {
                        data[key] = dataObject[key]
                    }

                    fs.writeFileSync(collectionPath, this.#encrypt(data), { encoding: "utf-8" })
                    return true
                } catch (error) {
                    this.#logger(error.message, 1)
                    return false
                }
            },
            delete: () => {
                try {
                    fs.unlinkSync(collectionPath)
                    return true
                } catch (error) {
                    this.#logger(error.message, 1)
                    return false
                }
            }
        }

        return collectionOptions
    }

    listCollections() {
        try {
            return fs.readdirSync(this.databaseName)
        } catch (error) {
            this.#logger(error.message, 1)
            return false
        }
    }

    deleteCollections() {
        try {
            for (let collection of this.listCollections()) {
                const collectionPath = path.join(this.databaseName, collection)
                fs.unlinkSync(collectionPath)
            }
            return true
        } catch (error) {
            this.#logger(error.message, 1)
            return false
        }
    }

    delete() {
        try {
            fs.rmSync(this.databaseName, { recursive: true })
            return true
        } catch (error) {
            this.#logger(error.message, 1)
            return false
        }
    }
}

module.exports = { OctaviaDB }