/**
 * @file encryptor
 * @description encryption and decryption.
 * @author madhanmaaz
 * @license MIT
 * @repository https://github.com/madhanmaaz/octavia-db
 */

const crypto = require("crypto")
const operations = require("./operations")

/**
 * Generates a random salt.
 * @returns {string} The generated salt in hexadecimal format.
 */
function generateSalt() {
    return crypto.randomBytes(16).toString('hex')
}

/**
 * Generates a cryptographic key from a password and salt.
 * @param {string} password - The password.
 * @param {string} salt - The salt.
 * @returns {Buffer} The generated key.
 */
function bufferKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256')
}

class Encryptor {
    /**
     * Encrypts data and writes it to a file.
     * @param {string} filePath - The path to the file.
     * @param {Object} data - The data to encrypt.
     * @param {string} password - The encryption password.
     * @param {boolean} encrypt - Whether to encrypt the data.
     * @throws {OctaviaError} If encryption or writing fails.
     */
    static encryption(filePath, data, password, encrypt) {
        if (encrypt) {
            try {
                const salt = generateSalt()
                const key = bufferKey(password, salt)
                const iv = crypto.randomBytes(16)

                const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
                let encryptedData = cipher.update(JSON.stringify(data), 'utf-8', 'hex')
                encryptedData += cipher.final('hex')

                operations.writeFile(filePath, {
                    encryptedData,
                    salt,
                    iv: iv.toString('hex'),
                    encrypt: encrypt
                })

            } catch (error) {
                throw new operations.OctaviaError(
                    `Failed to encrypt: ${error.message}`,
                    operations.OctaviaError.ERR_ENCRYPTION,
                    operations.response(false, `Failed to encrypt the data.`)
                )
            }
        } else {
            try {
                operations.writeFile(filePath, { unEncryptedData: data })
            } catch (error) {
                throw new operations.OctaviaError(
                    `Failed to write data: ${error.message}`,
                    operations.OctaviaError.ERR_WRITE,
                    operations.response(false, `Failed to write the data.`)
                )
            }
        }
    }

    /**
     * Decrypts data from a file.
     * @param {string} filePath - The path to the file.
     * @param {string} password - The decryption password.
     * @returns {Object} The decrypted data.
     * @throws {OctaviaError} If decryption or reading fails.
     */
    static decryption(filePath, password) {
        try {
            const { encryptedData, salt, iv, encrypt, unEncryptedData } = operations.readFile(filePath)

            if (encrypt) {
                const key = bufferKey(password, salt)
                const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'))

                let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8')
                decryptedData += decipher.final('utf-8')
                return JSON.parse(decryptedData)
            } else if (unEncryptedData) {
                return unEncryptedData
            }
        } catch (error) {
            if (error.code == 'ERR_OSSL_BAD_DECRYPT') {
                throw new operations.OctaviaError(
                    `Incorrect database password: ${error.message}`,
                    operations.OctaviaError.ERR_INCORRECT_PASSWORD,
                    operations.response(false, `Failed to decrypt. the password is incorrect.`)
                )
            } else {
                throw new operations.OctaviaError(
                    `Failed to decrypt: ${error.message}`,
                    operations.OctaviaError.ERR_DECRYPTION,
                    operations.response(false, `Failed to decrypt.`)
                )
            }
        }
    }
}

module.exports = { Encryptor }