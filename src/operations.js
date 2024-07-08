/**
 * @file operations
 * @description operations for OctaviaDB.
 * @author madhanmaaz
 * @license MIT
 * @repository https://github.com/madhanmaaz/octavia-db
 */


const fs = require("fs")

/**
 * Writes data to a file at the specified path.
 * @param {string} filePath - The path to the file.
 * @param {Object} data - The data to write to the file.
 */
function writeFile(filePath, data) {
    // writing json data into a file
    fs.writeFileSync(filePath, JSON.stringify(data), { encoding: "utf-8" })
}

/**
 * Reads data from a file at the specified path.
 * @param {string} filePath - The path to the file.
 * @returns {Object} The data read from the file.
 */
function readFile(filePath) {
    // reading json data from a file.
    return JSON.parse(fs.readFileSync(filePath, { encoding: "utf-8" }))
}

/**
 * Custom error class for OctaviaDB.
 * @extends Error
 */
class OctaviaError extends Error {
    /**
     * Constructs an OctaviaError.
     * @param {string} message - The error message.
     * @param {string} code - The error code.
     * @param {Object} [options={}] - Additional options to include with the error.
     */
    constructor(message, code, options = {}) {
        super(message)
        this.code = code

        // appending extra data object to a this object
        if (typeof options === "object") {
            Object.assign(this, options)
        }
    }

    // Error codes
    static ERR_DATABASE_NAME = "ERR_DATABASE_NAME"
    static ERR_DATABASE_PASSWORD = "ERR_DATABASE_PASSWORD"
    static ERR_DATABASE_INFORMATION = "ERR_DATABASE_INFORMATION"
    static ERR_DATABASE_CREATE = "ERR_DATABASE_CREATE"
    static ERR_DATABASE_DELETE = "ERR_DATABASE_DELETE"

    static ERR_ENCRYPTION = "ERR_ENCRYPTION"
    static ERR_DECRYPTION = "ERR_DECRYPTION"
    static ERR_INCORRECT_PASSWORD = "ERR_INCORRECT_PASSWORD"

    static ERR_COLLECTION_INFORMATION = "ERR_COLLECTION_INFORMATION"
    static ERR_COLLECTION_DELETE = "ERR_COLLECTION_DELETE"

    static ERR_DATA_OBJECT = "ERR_DATA_OBJECT"
    static ERR_DATA_ARRAY = "ERR_DATA_ARRAY"
    static ERR_DATA_SCHEME = "ERR_DATA_SCHEME"

    static ERR_WRITE = "ERR_WRITE"
    static ERR_READ = "ERR_READ"
}

/**
 * Creates a response object.
 * @param {boolean} ack - Acknowledgment status.
 * @param {string} msg - Response message.
 * @param {Object} [options] - Additional options to include in the response.
 * @returns {Object} The response object.
 */
function response(ack, msg, options) {
    // response to the client
    const data = {
        ack,
        msg
    }

    // appending extra data object to a this object
    if (typeof options === "object" && !Array.isArray(options)) {
        Object.assign(data, options)
    }

    return data
}

/**
 * Throws a validation error for a mismatched property type.
 * @param {string} property - The property with the mismatched type.
 * @param {string} schemeName - The expected type name.
 * @param {any} gottedType - The actual type received.
 * @throws {OctaviaError} The constructed validation error.
 */
function validationError(property, schemeName, gottedType) {
    // throw validationError
    const expected = `Expected ${schemeName}, got ${Array.isArray(gottedType) ? "Array" : typeof gottedType}.`

    throw new OctaviaError(
        `Invalid type for ${property}. ${expected}`,
        OctaviaError.ERR_DATA_SCHEME,
        response(false, `Failed to perform task. Mismatch dataScheme.`, {
            misMatch: property,
            expected
        })
    )
}

/**
 * Validates the data against a specified scheme.
 * @param {Object} data - The data to validate.
 * @param {Object} scheme - The validation scheme.
 * @throws {OctaviaError} If the data does not match the scheme.
 */
function validateScheme(data, scheme) {
    if (!scheme || typeof scheme !== "object" || Array.isArray(scheme)) {
        return false
    }

    for (const key in data) {
        if (!scheme[key]) {
            continue
        }

        const dataValue = data[key]
        const schemeValue = scheme[key]

        if (typeof schemeValue === 'function') {
            const schemeName = schemeValue.name
            const expectedType = schemeName.toLowerCase()

            if (expectedType === "array") {
                if (!Array.isArray(dataValue)) {
                    validationError(key, schemeName, dataValue)
                }
            } else if (expectedType === "object") {
                if (Array.isArray(dataValue) || typeof dataValue !== "object") {
                    validationError(key, schemeName, dataValue)
                }
            } else {
                if (typeof dataValue !== expectedType) {
                    validationError(key, schemeName, dataValue)
                }
            }

        } else if (typeof schemeValue === 'object') {
            if (typeof dataValue !== 'object' || Array.isArray(dataValue)) {
                validationError(key, 'Object', dataValue)
            }

            validateScheme(dataValue, schemeValue)
        }
    }
}

/**
 * Matches an object against a query.
 * @param {Object} obj - The object to match.
 * @param {Object} query - The query to match against.
 * @returns {boolean} True if the object matches the query, false otherwise.
 */
function matchQuery(obj, query) {
    // matching the query for the nested object
    return Object.keys(query).every(key => {
        if (typeof query[key] === 'object' && query[key] !== null && !Array.isArray(query[key])) {
            if (obj[key] === undefined || obj[key] === null) {
                return false
            }

            return matchQuery(obj[key], query[key])
        } else {
            return obj[key] === query[key]
        }
    })
}

/**
 * Deeply update the object with new data.
 * @param {Object} target - The object to match.
 * @param {Object} source - The query to match against.
 * @returns {Object} new updated data.
 */
function deepUpdate(target, source) {
    for (const key in source) {
        if (source[key] instanceof Object && target[key]) {
            Object.assign(source[key], deepUpdate(target[key], source[key]))
        }
    }

    Object.assign(target || {}, source)
    return target
}

/**
 * Throws an error if the data is not an object or is an array.
 * @param {any} data - The data to check.
 * @throws {OctaviaError} - If the data is not an object or is an array.
 */
function isNotObjectThrowError(data) {
    if (typeof data !== "object" || Array.isArray(data)) {
        throw new OctaviaError(
            "Datatype error. Object required.",
            OctaviaError.ERR_DATA_OBJECT,
            response(false, `Failed to perform the task. Object required.`)
        )
    }
}

/**
 * Throws an error if the data is not an array.
 * @param {any} data - The data to check.
 * @throws {OctaviaError} - If the data is not an array.
 */
function isNotArrayThrowError(data) {
    if (!Array.isArray(data)) {
        throw new OctaviaError(
            "Datatype error. Array required.",
            OctaviaError.ERR_DATA_ARRAY,
            response(false, `Failed to perform the task. Array required.`)
        )
    }
}

module.exports = {
    writeFile,
    readFile,
    response,
    validateScheme,
    matchQuery,
    deepUpdate,
    isNotArrayThrowError,
    isNotObjectThrowError,
    OctaviaError
}