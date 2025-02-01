const path = require("path")
const fs = require("fs")

const AES = require("./aes")
const helpers = require("./helpers")

class Document {
    constructor(documentName, encrypt, db) {
        this.documentName = documentName
        this.encrypt = encrypt
        this.database = db.database
        this.password = db.password
        this.autoCommitInterval = db.autoCommitInterval
        this.documentPath = path.join(this.database, this.documentName) + (this.encrypt ? ".enc" : "")
        this.isModified = false
        this.cache = {}

        if (fs.existsSync(this.documentPath)) {
            if (this.encrypt) {
                this.cache = AES.decrypt(this.documentPath, this.password)
            } else {
                try {
                    this.cache = JSON.parse(fs.readFileSync(this.documentPath, "utf-8"))
                } catch (error) {
                    throw new helpers.OctaviaError(
                        `Failed to read document: ${error.message}`,
                        helpers.OctaviaError.ERR_READ
                    )
                }
            }
        } else {
            try {
                if (this.encrypt) {
                    AES.encrypt(this.documentPath, {}, this.password)
                } else {
                    fs.writeFileSync(this.documentPath, "{}", "utf-8")
                }
            } catch (error) {
                throw new helpers.OctaviaError(
                    `Failed to initialize document: ${error.message}`,
                    helpers.OctaviaError.ERR_DOCUMENT_CREATE
                )
            }
        }

        if (this.autoCommitInterval) {
            this._autoCommitIntervalId = setInterval(() => {
                if (this.isModified) {
                    try {
                        this.commit()
                    } catch (error) {
                        console.error(`Auto-commit failed: ${error.message}`)
                    }
                }
            }, this.autoCommitInterval)
        }
    }

    commit() {
        if (!this.isModified) return

        if (this.encrypt) {
            AES.encrypt(this.documentPath, this.cache, this.password)
        } else {
            try {
                fs.writeFileSync(this.documentPath, JSON.stringify(this.cache), "utf-8")
            } catch (error) {
                throw new helpers.OctaviaError(
                    `Failed to write document: ${error.message}`,
                    helpers.OctaviaError.ERR_WRITE
                )
            }
        }

        this.isModified = false
    }

    info() {
        try {
            const stats = fs.statSync(this.documentPath)

            return {
                database: this.database,
                documentName: this.documentName,
                documentPath: this.documentPath,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                keyLength: Object.keys(this.cache).length
            }
        } catch (error) {
            throw new helpers.OctaviaError(
                `Failed to get document information: ${error.message}`,
                helpers.OctaviaError.ERR_DOCUMENT_INFORMATION,
            )
        }
    }

    delete() {
        try {
            fs.rmSync(this.documentPath, { force: true })
            this.cache = {}
            clearInterval(this._autoCommitIntervalId)
        } catch (error) {
            throw new helpers.OctaviaError(
                `Failed to delete document: ${error.message}`,
                helpers.OctaviaError.ERR_DOCUMENT_DELETE
            )
        }
    }

    get(key) {
        return this.cache[key]
    }

    set(key, value, immediateCommit = false) {
        this.cache[key] = value
        this.isModified = true

        if (immediateCommit) {
            this.commit()
        }
    }

    delete(key, immediateCommit = false) {
        delete this.cache[key]
        this.isModified = true

        if (immediateCommit) {
            this.commit()
        }
    }
}

module.exports = Document