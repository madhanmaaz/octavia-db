const fs = require("fs")
const path = require("path")
const crypto = require('crypto')

class OctaviaDB {
    constructor({ databaseName, databasePassword, logging = false }) {
        if (!databasePassword) {
            this.#logger("Database password is required.", 11);
        }

        this.databaseName = databaseName
        this.databasePassword = databasePassword
        this.logging = logging
        this.#createDatabase()
    }

    // private 
    #createDatabase() {
        try {
            if (!fs.existsSync(this.databaseName)) {
                fs.mkdirSync(this.databaseName, { recursive: true })
                this.#logger(`${this.databaseName} DB created successfully.`)
            }
        } catch (error) {
            this.#logger(error.message, 11)
        }
    }

    #logger(data, type) {
        let value = `[OCTAVIA LOG] ${data}`
        if (type == 1) {
            value = `[OCTAVIA ERROR] ${data}`
        } else if (type == 11) {
            throw new Error(value)
        }
        if (this.logging) console.log(value)
    }

    // read & write
    #writeFile(filePath, data) {
        const folder = path.dirname(filePath)
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true })
        }

        try {
            fs.writeFileSync(filePath, JSON.stringify(data), { encoding: "utf-8" })
            return true
        } catch (error) {
            this.#logger(`writing to file: ${error.message}`, 1)
            return false
        }
    }

    #readFile(filePath) {
        try {
            return JSON.parse(fs.readFileSync(filePath, { encoding: "utf-8" }))
        } catch (error) {
            this.#logger(`reading from file: ${error.message}`, 1);
        }
    }

    // encryption
    #generateSalt() {
        try {
            return crypto.randomBytes(16).toString('hex')
        } catch (error) {
            this.#logger(error.message, 11)
        }
    }

    #bufferKey(salt) {
        try {
            return crypto.pbkdf2Sync(this.databasePassword, salt, 10000, 32, 'sha256')
        } catch (error) {
            this.#logger(error.message, 11)
        }
    }

    #encryption(collectionFilePath, data, encrypt) {
        if (encrypt) {
            try {
                const salt = this.#generateSalt()
                const key = this.#bufferKey(salt)
                const iv = crypto.randomBytes(16)

                const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
                let encryptedData = cipher.update(JSON.stringify(data), 'utf-8', 'hex')
                encryptedData += cipher.final('hex')
                return this.#writeFile(collectionFilePath, { encryptedData, salt, iv: iv.toString('hex'), encrypt })
            } catch (error) {
                this.#logger(`Encryption error: ${error.message}`, 11)
                return false
            }
        } else {
            return this.#writeFile(collectionFilePath, { unEncryptedData: data })
        }
    }

    #decryption(collectionFilePath) {
        const { encryptedData, salt, iv, encrypt, unEncryptedData } = this.#readFile(collectionFilePath)

        if (encrypt) {
            try {
                const key = this.#bufferKey(salt)
                const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'))

                let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8')
                decryptedData += decipher.final('utf-8')
                return JSON.parse(decryptedData)
            } catch (error) {
                if (error.code == 'ERR_OSSL_BAD_DECRYPT') {
                    this.#logger("Incorrect database password.", 1);
                } else {
                    this.#logger(`Decryption error: ${error.message}`, 11);
                }
                return false
            }
        } else if (unEncryptedData) {
            return unEncryptedData
        }
    }

    #dataBaseInfo(folderPath) {
        let totalSize = 0
        let ALLfiles = []

        function traverseDirectory(dirPath) {
            const files = fs.readdirSync(dirPath)

            files.forEach(file => {
                const filePath = path.join(dirPath, file)
                const stats = fs.statSync(filePath)


                if (stats.isDirectory()) {
                    traverseDirectory(filePath)
                } else {
                    ALLfiles.push(filePath)
                    totalSize += stats.size
                }
            })
        }

        traverseDirectory(folderPath)
        const databaseFolderInfo = fs.statSync(this.databaseName)
        return {
            created: databaseFolderInfo.birthtime,
            modified: databaseFolderInfo.mtime,
            size: this.#getSizeCaption(totalSize),
            files: ALLfiles
        }
    }

    #getSizeCaption(size) {
        const totalSizeInKB = size / 1024
        const totalSizeInMB = totalSizeInKB / 1024
        const totalSizeInGB = totalSizeInMB / 1024

        return {
            KB: totalSizeInKB.toFixed(2),
            MB: totalSizeInMB.toFixed(2),
            GB: totalSizeInGB.toFixed(2),
        }
    }

    #checkIfObject(data) {
        if (typeof data !== 'object') {
            this.#logger('Required object.', 11)
        }
    }

    // public
    collection(collectionName, encrypt = true) {
        const collectionFilePath = path.join(this.databaseName, collectionName)

        try {
            if (!fs.existsSync(collectionFilePath)) {
                this.#encryption(collectionFilePath, [], encrypt)
                this.#logger(`${collectionName} collection created successfully.`)
            }
        } catch (error) {
            if (fs.existsSync(collectionFilePath)) {
                fs.rmSync(collectionFilePath, { recursive: true })
            }
            this.#logger(`Error initializing collection: ${error.message}`, 1);
        }

        const collectionOptions = {
            info: () => {
                try {
                    const stats = fs.statSync(collectionFilePath)

                    return {
                        databaseName: this.databaseName,
                        collectionName,
                        collectionFilePath,
                        size: this.#getSizeCaption(stats.size),
                        created: stats.birthtime,
                        modified: stats.mtime
                    }
                } catch (error) {
                    if (error.code == "ENOENT") {
                        this.#logger(`Collection info : ${error.message}`, 1);
                    }
                    return false
                }
            },
            delete: () => {
                try {
                    fs.rmSync(collectionFilePath, { recursive: true })
                    this.#logger(`${collectionName} collection deleted successfully.`)
                    return true
                } catch (error) {
                    this.#logger(`Deleting collection: ${error.message}`, 1);
                    return false
                }
            },

            // crud
            insert: (data) => {
                this.#checkIfObject(data)
                const decryptedData = this.#decryption(collectionFilePath)
                decryptedData.push(data)

                return this.#encryption(collectionFilePath, decryptedData, encrypt)
            },
            insertMany: (data) => {
                if (!Array.isArray(data)) this.#logger('Required Array.', 11)
                const decryptedData = this.#decryption(collectionFilePath)
                return this.#encryption(collectionFilePath, decryptedData.concat(data), encrypt)
            },
            find: (identifiers) => {
                this.#checkIfObject(identifiers)
                const decryptedData = this.#decryption(collectionFilePath)

                const checking = decryptedData.filter(obj => {
                    const possiabilities = []
                    for (const key in identifiers) {
                        possiabilities.push(obj[key] == identifiers[key])
                    }
                    if (!possiabilities.includes(false)) {
                        return obj
                    }
                })

                if (checking.length == 0) return false
                return checking[0]
            },
            findMany: (identifiers) => {
                this.#checkIfObject(identifiers)
                const decryptedData = this.#decryption(collectionFilePath)

                const checking = decryptedData.filter(obj => {
                    const possiabilities = []
                    for (const key in identifiers) {
                        possiabilities.push(obj[key] == identifiers[key])
                    }
                    if (!possiabilities.includes(false)) {
                        return obj
                    }
                })

                if (checking.length == 0) return false
                return checking
            },
            update: (identifiers, newData) => {
                this.#checkIfObject(identifiers)
                this.#checkIfObject(newData)

                const decryptedData = this.#decryption(collectionFilePath)
                const checking = decryptedData.filter(obj => {
                    const possiabilities = []
                    for (const key in identifiers) {
                        possiabilities.push(obj[key] == identifiers[key])
                    }
                    if (!possiabilities.includes(false)) {
                        return obj
                    }
                })

                if (checking.length == 0) return false
                const oldData = checking[0]
                for (const key in newData) {
                    oldData[key] = newData[key]
                }

                return this.#encryption(collectionFilePath, decryptedData, encrypt)
            },
            updateMany: (identifiers, newData) => {
                this.#checkIfObject(identifiers, newData)

                const decryptedData = this.#decryption(collectionFilePath)
                const checking = decryptedData.filter(obj => {
                    const possiabilities = []
                    for (const key in identifiers) {
                        possiabilities.push(obj[key] == identifiers[key])
                    }
                    if (!possiabilities.includes(false)) {
                        return obj
                    }
                })

                if (checking.length == 0) return false
                for (const oldData of checking) {
                    for (const key in newData) {
                        oldData[key] = newData[key]
                    }
                }

                return this.#encryption(collectionFilePath, decryptedData, encrypt)
            },
            remove: (identifiers) => {
                this.#checkIfObject(identifiers)

                const decryptedData = this.#decryption(collectionFilePath)
                let finderData = []
                let data = []

                decryptedData.filter(obj => {
                    const possiabilities = []
                    for (const key in identifiers) {
                        possiabilities.push(obj[key] == identifiers[key])
                    }

                    if (!possiabilities.includes(false)) {
                        finderData.push(obj)
                    } else {
                        data.push(obj)
                    }
                })

                if (finderData.length == 0) return false
                finderData.shift()
                return this.#encryption(collectionFilePath, data.concat(finderData), encrypt)
            },
            removeMany: (identifiers) => {
                this.#checkIfObject(identifiers)

                const decryptedData = this.#decryption(collectionFilePath)
                const checking = decryptedData.filter(obj => {
                    const possiabilities = []
                    for (const key in identifiers) {
                        possiabilities.push(obj[key] == identifiers[key])
                    }
                    if (!possiabilities.includes(false)) {
                        return obj
                    }
                })

                if (checking.length == 0) return false

                const modifiedData = decryptedData.filter(obj => {
                    const possiabilities = []
                    for (const key in identifiers) {
                        possiabilities.push(obj[key] == identifiers[key])
                    }
                    if (possiabilities.includes(false)) {
                        return obj
                    }
                })

                return this.#encryption(collectionFilePath, modifiedData, encrypt)
            }
        }

        return collectionOptions
    }

    info() {
        try {
            const { size, created, modified, files } = this.#dataBaseInfo(this.databaseName)
            return {
                databaseName: this.databaseName,
                collections: fs.readdirSync(this.databaseName),
                size,
                created,
                modified,
                files
            }
        } catch (error) {
            this.#logger(`Database info error: ${error.message}`, 1);
            return false
        }
    }

    delete() {
        try {
            fs.rmSync(this.databaseName, { recursive: true })
            this.#logger(`${this.databaseName} DB deleted successfully.`)
            return true
        } catch (error) {
            this.#logger(`Deleting database: ${error.message}`, 1);
            return false
        }
    }
}

module.exports = { OctaviaDB }