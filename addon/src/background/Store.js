class Store {
  constructor() {
    this.STORE = [];
  }

  get(tab) {
    return this.STORE.find(storedTab => storedTab.id === tab.id);
  }

  add(storeObject) {
    this.STORE.push(storeObject); // = {tabData, connectionData}
  }

  remove(tab) {
    this.STORE = this.STORE.filter(storedTab => storedTab.id !== tab.id);
  }

  clear() {
    this.STORE = [];
  }

  getSize() {
    return this.STORE.length;
  }

  getAll() {
    return this.STORE;
  }
}
