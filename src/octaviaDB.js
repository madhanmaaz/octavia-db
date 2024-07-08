/**
 * @file octaviaDB
 * @description OctaviaDB class.
 * @author madhanmaaz
 * @license MIT
 * @repository https://github.com/madhanmaaz/octavia-db
 */

const fs = require("fs")
const path = require("path")
const operations = require("./operations")
const { Collection } = require("./collection")


class OctaviaDB {
    /**
     * Constructs an instance of OctaviaDB.
     * @param {Object} config - The configuration object.
     * @param {string} config.database - The name of the database.
     * @param {string} config.password - The password for the database.
     * @throws {OctaviaError} If database name or password is invalid.
     */
    constructor({ database, password }) {
        // Validate the database name
        if (!database || typeof database !== "string" || database.length == 0) {
            throw new operations.OctaviaError(
                "Database name is invalid.",
                operations.OctaviaError.ERR_DATABASE_NAME,
                operations.response(false, `Failed to create database. Invalid database name.`)
            )
        }

        // Validate the database password
        if (!password || typeof password !== "string" || password.length == 0) {
            throw new operations.OctaviaError(
                "Database password is invalid.",
                operations.OctaviaError.ERR_DATABASE_PASSWORD,
                operations.response(false, `Failed to create database. Invalid database password.`)
            )
        }

        this.database = database
        this.password = password

        // Create the database directory if it does not exist
        if (!fs.existsSync(this.database)) {
            try {
                // creating database folder
                fs.mkdirSync(this.database, { recursive: true })
            } catch (error) {
                throw new operations.OctaviaError(
                    `Failed to create database: ${error.message}`,
                    operations.OctaviaError.ERR_DATABASE_CREATE,
                    operations.response(false, `Failed to create '${this.database}' database.`)
                )
            }
        }
    }

    /**
     * Retrieves information about the database.
     * @returns {Object} An object containing information about the database.
     * @throws {OctaviaError} If unable to retrieve database information.
     */
    info() {
        try {
            const collections = fs.readdirSync(this.database)
            let size = 0
            const files = []

            collections.forEach(fileName => {
                const filePath = path.join(this.database, fileName)
                const stats = fs.statSync(filePath)

                if (stats.isFile()) {
                    files.push(filePath)
                    size += stats.size
                }
            })

            const databaseFolderStats = fs.statSync(this.database)
            return {
                database: this.database,
                created: databaseFolderStats.birthtime,
                modified: databaseFolderStats.mtime,
                collections,
                size,
                files
            }
        } catch (error) {
            throw new operations.OctaviaError(
                `Failed to get database information: ${error.message}`,
                operations.OctaviaError.ERR_DATABASE_INFORMATION,
                operations.response(false, `Failed to get '${this.database}' database information.`)
            )
        }
    }

    /**
     * Deletes the entire database.
     * @returns {Object} A response object indicating the success of the operation.
     * @throws {OctaviaError} If unable to delete the database.
     */
    delete() {
        try {
            // remove the entire database 
            fs.rmSync(this.database, { recursive: true })

            return operations.response(
                true,
                `'${this.database}' Database deleted successfully.`
            )
        } catch (error) {
            throw new operations.OctaviaError(
                `Failed to delete '${this.database}' database: ${error.message}`,
                operations.OctaviaError.ERR_DATABASE_DELETE,
                operations.response(false, `Failed to delete '${this.database}' database.`)
            )
        }
    }

    /**
     * Creates a new collection within the database.
     * @param {string} collectionName - The name of the collection.
     * @param {boolean} [encrypt=true] - Whether the collection should be encrypted.
     * @returns {Collection} The created collection.
     */
    Collection(collectionName, encrypt = true) {
        // creating collection Object
        return new Collection(collectionName, encrypt, this)
    }

    /**
     * Checks if a collection exists in the database.
     * @param {string} collectionName - The name of the collection.
     * @returns {boolean} True if the collection exists, false otherwise.
     */
    collectionExists(collectionName) {
        // check if the collection exists
        return fs.existsSync(path.join(this.database, collectionName))
    }
}

module.exports = { OctaviaDB }