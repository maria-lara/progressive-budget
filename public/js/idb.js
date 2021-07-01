// Indexed Database Functionality

//variable for the db connection
let db;

//connection to IndexedDB database called 'budget' and set it to version 1
const request = indexedDB.open('budget', 1);


//database version changes
request.onupgradeneeded = function(event) {
    db = event.target.result;
    //store (table) called `new_transaction`
    db.createObjectStore('new_transaction', { autoIncrement: true });
  };
//successful event
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransactions(db);
    }
  };
//error
  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };

// no internet connection
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');
  
    transactionObjectStore.add(record);
  }
// uploads data
function uploadTransactions() {

    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');
    const getAll = transactionObjectStore.getAll();

    // successful .getAll() 


window.addEventListener('online', uploadTransactions);