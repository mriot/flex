class Store {
  constructor() {
    this.STORE = [];
  }

  get(tab) {
    return this.STORE.find(entry => entry.tab.id === tab.id);
  }

  add(storeObject) {
    this.STORE.push(storeObject); // = {tabData, connectionData}
  }

  remove(tab) {
    this.STORE = this.STORE.filter(entry => entry.tab.id !== tab.id);
  }

  clear() {
    this.STORE = [];
  }

  getStoreSize() {
    return this.STORE.length;
  }

  getStore() {
    return this.STORE;
  }
}
