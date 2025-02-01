const Base = require("./base")

class DataObject extends Base {
    constructor(dataObjectName, encrypt, db) {
        super(dataObjectName, encrypt, db, false)
    }

    set(key, value, immediateCommit = false) {
        this.cache[key] = value
        this.isModified = true

        if (immediateCommit) {
            this.commit()
        }
    }

    get(key) {
        return this.cache[key]
    }

    update(data) {
        Object.assign(this.cache, data)
        this.isModified = true
    }

    remove(key, immediateCommit = false) {
        delete this.cache[key]
        this.isModified = true

        if (immediateCommit) {
            this.commit()
        }
    }
}

module.exports = DataObject