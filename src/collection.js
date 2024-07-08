/**
 * @file collection
 * @description collection class.
 * @author madhanmaaz
 * @license MIT
 * @repository https://github.com/madhanmaaz/octavia-db
 */


const fs = require("fs")
const path = require("path")
const operations = require("./operations")
const { Encryptor } = require("./encryptor")

class Collection {
    /**
     * @constructor
     * @param {string} collectionName - The name of the collection.
     * @param {boolean} encrypt - Whether to encrypt the collection data.
     * @param {object} DB - The OctaviaDB instance.
     */
    constructor(collectionName, encrypt, DB) {
        this.collectionName = collectionName
        this.encrypt = encrypt
        this.database = DB.database
        this.password = DB.password
        this.collectionPath = path.join(this.database, this.collectionName)

        if (!fs.existsSync(this.collectionPath)) {
            Encryptor.encryption(this.collectionPath, [], this.password, this.encrypt)
        }
    }

    /**
     * Inserts a single data object into the collection.
     * @param {object} data - The data to insert.
     * @param {object} dataScheme - The schema of the data.
     * @returns {object} - Response object indicating success or failure.
     */
    insert(data, dataScheme) {
        operations.isNotObjectThrowError(data)
        operations.validateScheme(data, dataScheme)

        const decryptedData = Encryptor.decryption(this.collectionPath, this.password)
        decryptedData.push(data)
        Encryptor.encryption(this.collectionPath, decryptedData, this.password, this.encrypt)

        return operations.response(true, "Record inserted successfully.")
    }

    /**
     * Inserts multiple data objects into the collection.
     * @param {Array} data - Array of data objects to insert.
     * @param {object} dataScheme - The schema of the data.
     * @returns {object} - Response object indicating success or failure.
     */
    insertMany(data, dataScheme) {
        operations.isNotArrayThrowError(data)
        for (const obj of data) {
            operations.validateScheme(obj, dataScheme)
        }

        const decryptedData = Encryptor.decryption(this.collectionPath, this.password)
        Encryptor.encryption(this.collectionPath, decryptedData.concat(data), this.password, this.encrypt)
        return operations.response(true, "Records inserted successfully.")
    }

    /**
     * Finds a single data object in the collection that matches the query.
     * @param {object} query - The query to match against.
     * @returns {object|undefined} - The matching data object, or undefined if no match is found.
     */
    find(query) {
        operations.isNotObjectThrowError(query)
        const decryptedData = Encryptor.decryption(this.collectionPath, this.password)

        return decryptedData.find(obj => {
            return operations.matchQuery(obj, query)
        })
    }

    /**
     * Finds all data objects in the collection that match the query.
     * @param {object} query - The query to match against.
     * @returns {Array} - Array of matching data objects.
     */
    findMany(query) {
        operations.isNotObjectThrowError(query)
        const decryptedData = Encryptor.decryption(this.collectionPath, this.password)

        return decryptedData.filter(obj => {
            return operations.matchQuery(obj, query)
        })
    }

    /**
     * Updates a single data object in the collection that matches the query.
     * @param {object} query - The query to match against.
     * @param {object} newData - The new data to update.
     * @returns {object} - Response object indicating success or failure.
     */
    update(query, newData, dataScheme) {
        operations.isNotObjectThrowError(query)
        operations.isNotObjectThrowError(newData)
        operations.validateScheme(query, dataScheme)

        const decryptedData = Encryptor.decryption(this.collectionPath, this.password)
        const index = decryptedData.findIndex(obj => {
            return operations.matchQuery(obj, query)
        })

        if (index === -1) {
            return operations.response(false, `No matching record found.`);
        }

        operations.deepUpdate(decryptedData[index], newData)
        Encryptor.encryption(this.collectionPath, decryptedData, this.password, this.encrypt)
        return operations.response(true, `Record updated successfully.`, { updated: decryptedData[index] })
    }

    /**
     * Updates multiple data objects in the collection that match the query.
     * @param {object} query - The query to match against.
     * @param {object} newData - The new data to update.
     * @returns {object} - Response object indicating success or failure.
     */
    updateMany(query, newData, dataScheme) {
        operations.isNotObjectThrowError(query)
        operations.validateScheme(query, dataScheme)

        const decryptedData = Encryptor.decryption(this.collectionPath, this.password)
        let updatedCount = 0
        decryptedData.forEach((obj, index) => {
            if (operations.matchQuery(obj, query)) {
                operations.deepUpdate(obj, newData)
                updatedCount++
            }
        })

        Encryptor.encryption(this.collectionPath, decryptedData, this.password, this.encrypt)
        return operations.response(true, `Records updated successfully.`, { updatedCount })
    }

    /**
     * Removes a single data object in the collection that matches the query.
     * @param {object} query - The query to match against.
     * @returns {object} - Response object indicating success or failure.
     */
    remove(query) {
        operations.isNotObjectThrowError(query)

        const decryptedData = Encryptor.decryption(this.collectionPath, this.password)
        const index = decryptedData.findIndex(obj => operations.matchQuery(obj, query))

        if (index === -1) {
            // If no matching record is found
            return operations.response(false, `No matching record found to remove.`)
        }

        const [removedRecord] = decryptedData.splice(index, 1)
        Encryptor.encryption(this.collectionPath, decryptedData, this.password, this.encrypt)
        return operations.response(true, `Record removed successfully.`, { removedRecord })
    }

    /**
     * Removes all data objects in the collection that match the query.
     * @param {object} query - The query to match against.
     * @returns {object} - Response object indicating success or failure.
     */
    removeMany(query) {
        operations.isNotObjectThrowError(query)

        const decryptedData = Encryptor.decryption(this.collectionPath, this.password)
        const originalLength = decryptedData.length
        const filteredData = decryptedData.filter(obj => !operations.matchQuery(obj, query))
        const removedCount = originalLength - filteredData.length

        Encryptor.encryption(this.collectionPath, filteredData, this.password, this.encrypt)
        return operations.response(true, `Records removed successfully.`, { removedCount })
    }

    /**
     * Retrieves information about the collection.
     * @returns {object} - An object containing information about the collection.
     */
    info() {
        try {
            const stats = fs.statSync(this.collectionPath)
            const decryptedData = Encryptor.decryption(this.collectionPath, this.password)

            return {
                database: this.database,
                collectionName: this.collectionName,
                collectionPath: this.collectionPath,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                records: decryptedData.length
            }
        } catch (error) {
            throw new operations.OctaviaError(
                `Failed to get collection information: ${error.message}`,
                operations.OctaviaError.ERR_COLLECTION_INFORMATION,
                operations.response(false, `Failed to get '${this.database}.${this.collectionName}' information.`))
        }
    }

    /**
     * Deletes the collection.
     * @returns {object} - Response object indicating success or failure.
     */
    delete() {
        try {
            fs.rmSync(this.collectionPath, { recursive: true })
            return operations.response(
                true,
                `'${this.collectionName}' collection deleted successfully.`
            )
        } catch (error) {
            throw new operations.OctaviaError(
                `Deleting collection: ${error.message}`,
                operations.OctaviaError.ERR_COLLECTION_DELETE,
                operations.response(false, `Failed to delete the collection '${this.database}.${this.collectionName}'.`)
            )
        }
    }
}

module.exports = { Collection }