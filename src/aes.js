const crypto = require("crypto")
const fs = require("fs")
const zlib = require("zlib")

const helpers = require("./helpers")

function passwordToKey(password, saltBuffer) {
    return crypto.pbkdf2Sync(password, saltBuffer, 100000, 32, "sha256")
}

function encrypt(filePath, data, password) {
    try {
        const compressedData = zlib.deflateSync(JSON.stringify(data))
        const saltBuffer = crypto.randomBytes(16)
        const ivBuffer = crypto.randomBytes(16)
        const keyBuffer = passwordToKey(password, saltBuffer)

        const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, ivBuffer)
        const encrypted = Buffer.concat([
            cipher.update(compressedData),
            cipher.final()
        ])

        fs.writeFileSync(filePath, Buffer.concat([saltBuffer, ivBuffer, encrypted]))
    } catch (error) {
        throw new helpers.OctaviaError(`Failed to encrypt: ${error.message}`)
    }
}

function decrypt(filePath, password) {
    try {
        const data = fs.readFileSync(filePath)
        const saltBuffer = data.slice(0, 16)
        const ivBuffer = data.slice(16, 32)
        const keyBuffer = passwordToKey(password, saltBuffer)

        const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, ivBuffer)
        const decrypted = Buffer.concat([
            decipher.update(data.slice(32)),
            decipher.final()
        ])

        return JSON.parse(zlib.inflateSync(decrypted))
    } catch (error) {
        if (error.code == 'ERR_OSSL_BAD_DECRYPT') {
            throw new helpers.OctaviaError(`Incorrect database password: ${error.message}`)
        }

        throw new helpers.OctaviaError(`Failed to decrypt: ${error.message}`)
    }
}

module.exports = {
    encrypt,
    decrypt
}