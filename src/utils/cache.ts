enum storageType {
  Local,
  Session
}

class Cache {
  storage: Storage
  constructor(Type: storageType) {
    this.storage = Type === storageType.Local ? localStorage : sessionStorage
  }

  setItem(key: string, value: any) {
    this.storage.setItem(key, JSON.stringify(value))
  }

  getItem(key: string) {
    const value = this.storage.getItem(key)
    if (value) {
      return JSON.parse(value)
    }
    return null
  }

  removeItem(key: string) {
    this.storage.removeItem(key)
  }

  clear() {
    this.storage.clear()
  }
}

const localCache = new Cache(storageType.Local)
const sessionCache = new Cache(storageType.Session)

export { localCache, sessionCache }
