
// Custom error class for OctaviaDB.
class OctaviaError extends Error {
    constructor(message, options) {
        super(message)

        if (typeof options === "object" && !Array.isArray(options)) {
            Object.assign(this, options)
        }
    }
}

// Throws an error if the data is not an object or is an array.
function isNotObjectThrowError(data) {
    if (typeof data !== "object" || Array.isArray(data)) {
        throw new OctaviaError("Datatype error. Object required.")
    }
}

// Throws an error if the data is not an array.
function isNotArrayThrowError(data) {
    if (!Array.isArray(data)) {
        throw new OctaviaError("Datatype error. Array required.")
    }
}

module.exports = {
    isNotObjectThrowError,
    isNotArrayThrowError,
    OctaviaError
}