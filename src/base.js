const fs = require("fs")
const path = require("path")

const AES = require("./aes")
const helpers = require("./helpers")

class Base {
    constructor(name, encrypt, db, isCollection = false) {
        this.name = name
        this.encrypt = encrypt
        this.database = db.database
        this.password = db.password
        this.autoCommitInterval = db.autoCommitInterval
        this.filePath = path.join(this.database, this.name) + (this.encrypt ? ".enc" : "")
        this.cache = isCollection ? [] : {}
        this.isModified = false

        if (fs.existsSync(this.filePath)) {
            if (this.encrypt) {
                this.cache = AES.decrypt(this.filePath, this.password)
            } else {
                this.cache = JSON.parse(fs.readFileSync(this.filePath, "utf-8"))
            }
        } else {
            if (this.encrypt) {
                AES.encrypt(this.filePath, this.cache, this.password)
            } else {
                fs.writeFileSync(this.filePath, JSON.stringify(this.cache), "utf-8")
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
            AES.encrypt(this.filePath, this.cache, this.password)
        } else {
            fs.writeFileSync(this.filePath, JSON.stringify(this.cache), "utf-8")
        }

        this.isModified = false
    }

    info() {
        try {
            const stats = fs.statSync(this.filePath)

            return {
                database: path.basename(this.database),
                databasePath: this.database,
                name: this.name,
                filePath: this.filePath,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                recordCount: Array.isArray(this.cache) ? this.cache.length : Object.keys(this.cache).length
            }
        } catch (error) {
            throw new helpers.OctaviaError(`Failed to get file information: ${error.message}`)
        }
    }

    delete() {
        try {
            fs.rmSync(this.filePath, { force: true })
            this.cache = Array.isArray(this.cache) ? [] : {}
            clearInterval(this._autoCommitIntervalId)
        } catch (error) {
            throw new helpers.OctaviaError(`Failed to delete file: ${error.message}`)
        }
    }
}

module.exports = Base