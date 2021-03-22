class Store {
  constructor() {
    this.STORE = [];
  }

  get(tabId) {
    return this.STORE.find(entry => entry.tab.id === tabId);
  }

  add(storeObject) {
    // storeObject = {tabData, connectionData}
    return this.STORE;
  }

  remove(tabId) {
    this.STORE.filter(entry => entry.tab.id !== tabId);
    return this.STORE;
  }

  clear() {
    this.STORE = [];
    return this.STORE;
  }

  getStoreSize() {
    return this.STORE.length;
  }

  getStore() {
    return this.STORE;
  }
}
