const fs = require("fs")
const path = require("path")

const Collection = require("./collection")
const DataObject = require("./dataObject")
const helpers = require("./helpers")

class OctaviaDB {
    constructor({
        database = "",
        password = "",
        autoCommitInterval = 10000
    }) {
        if (!database.trim()) {
            throw new helpers.OctaviaError("Database name is invalid.")
        }

        if (!password.trim()) {
            throw new helpers.OctaviaError("Database password is invalid.")
        }

        this.database = path.resolve(database)
        this.password = password
        this.autoCommitInterval = autoCommitInterval

        if (!fs.existsSync(this.database)) {
            try {
                fs.mkdirSync(this.database, { recursive: true })
            } catch (error) {
                throw new helpers.OctaviaError(`Failed to create database: ${error.message}`)
            }
        }
    }

    info() {
        try {
            let totalSize = 0
            const totalFiles = []

            function calculateSize(folderPath) {
                const files = fs.readdirSync(folderPath)

                for (const file of files) {
                    const filePath = path.join(folderPath, file)
                    const stats = fs.statSync(filePath)

                    if (stats.isDirectory()) {
                        calculateSize(filePath)
                    } else {
                        totalSize += stats.size
                        totalFiles.push(filePath)
                    }
                }
            }

            const stats = fs.statSync(this.database)
            calculateSize(this.database)

            return {
                database: path.basename(this.database),
                path: path.resolve(this.database),
                created: stats.birthtime,
                modified: stats.mtime,
                files: totalFiles,
                size: totalSize, // Bytes
                sizeMB: (totalSize / 1024 / 1024).toFixed(2) + " MB"
            }
        } catch (error) {
            throw new helpers.OctaviaError(`Failed to get database information: ${error.message}`)
        }
    }

    delete() {
        try {
            fs.rmSync(this.database, { recursive: true })
        } catch (error) {
            throw new helpers.OctaviaError(`Failed to delete '${this.database}' database: ${error.message}`)
        }
    }

    collection(collectionName, encrypt = true) {
        return new Collection(collectionName, encrypt, this)
    }

    dataObject(dataObjectName, encrypt = true) {
        return new DataObject(dataObjectName, encrypt, this)
    }

    collectionExists(collectionName) {
        return fs.existsSync(path.join(this.database, collectionName))
    }

    documentExists(documentName) {
        return fs.existsSync(path.join(this.database, documentName))
    }
}

module.exports = OctaviaDB