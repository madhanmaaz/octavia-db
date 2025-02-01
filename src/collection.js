const Base = require("./base")
const helpers = require("./helpers")

class Collection extends Base {
    constructor(collectionName, encrypt, db) {
        super(collectionName, encrypt, db, true)
    }

    _matchesQuery(item, query) {
        return Object.keys(query).every(key => item[key] === query[key])
    }

    insert(data, immediateCommit = false) {
        helpers.isNotObjectThrowError(data)

        this.cache.push(data)
        this.isModified = true

        if (immediateCommit) {
            this.commit()
        }
    }

    insertMany(dataArray, immediateCommit = false) {
        helpers.isNotArrayThrowError(dataArray)

        this.cache.push(...dataArray)
        this.isModified = true

        if (immediateCommit) {
            this.commit()
        }
    }

    find(query) {
        helpers.isNotObjectThrowError(query)
        return this.findMany(query)[0] || null
    }

    findMany(query) {
        helpers.isNotObjectThrowError(query)
        return this.cache.filter(item => this._matchesQuery(item, query))
    }

    update(query, newData, immediateCommit = false) {
        helpers.isNotObjectThrowError(query)
        helpers.isNotObjectThrowError(newData)

        const item = this.find(query)
        if (item) {
            Object.assign(item, newData)
            this.isModified = true

            if (immediateCommit) {
                this.commit()
            }
        }
    }

    updateMany(query, newData, immediateCommit = false) {
        helpers.isNotObjectThrowError(query)
        helpers.isNotObjectThrowError(newData)

        let updated = false

        this.cache.forEach(item => {
            if (this._matchesQuery(item, query)) {
                Object.assign(item, newData)
                updated = true
            }
        })

        if (updated) {
            this.isModified = true
            if (immediateCommit) {
                this.commit()
            }
        }
    }

    remove(query, immediateCommit = false) {
        const index = this.cache.findIndex(item => this._matchesQuery(item, query))

        if (index !== -1) {
            this.cache.splice(index, 1)
            this.isModified = true

            if (immediateCommit) {
                this.commit()
            }
        }
    }

    removeMany(query, immediateCommit = false) {
        const initialLength = this.cache.length
        this.cache = this.cache.filter(item => !this._matchesQuery(item, query))

        if (this.cache.length !== initialLength) {
            this.isModified = true
            if (immediateCommit) {
                this.commit()
            }
        }
    }
}

module.exports = Collection