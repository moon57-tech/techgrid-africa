/* ============================================================
   Techgrid Africa — Local database (IndexedDB)
   Object stores: orders, payments
   A tiny promise wrapper around IndexedDB used to track orders
   and payments in the browser.
   ============================================================ */
const DB = (function () {
  const DB_NAME = "techgrid_db";
  const DB_VERSION = 1;
  let _db = null;

  function open() {
    return new Promise(function (resolve, reject) {
      if (_db) return resolve(_db);
      if (!window.indexedDB) {
        reject(new Error("IndexedDB is not supported in this browser."));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("orders")) {
          db.createObjectStore("orders", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("payments")) {
          db.createObjectStore("payments", { keyPath: "id" });
        }
      };
      req.onsuccess = function (e) { _db = e.target.result; resolve(_db); };
      req.onerror = function (e) { reject(e.target.error || new Error("IndexedDB open failed")); };
    });
  }

  function run(store, mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        const t = db.transaction(store, mode);
        const s = t.objectStore(store);
        const r = fn(s);
        r.onsuccess = function () { resolve(r.result); };
        r.onerror = function () { reject(r.error || new Error("IndexedDB request failed")); };
      });
    });
  }

  function getAll(store) { return run(store, "readonly", function (s) { return s.getAll(); }); }
  function get(store, key) { return run(store, "readonly", function (s) { return s.get(key); }); }
  function put(store, value) { return run(store, "readwrite", function (s) { return s.put(value); }); }
  function del(store, key) { return run(store, "readwrite", function (s) { return s.delete(key); }); }

  return { open: open, getAll: getAll, get: get, put: put, del: del };
})();