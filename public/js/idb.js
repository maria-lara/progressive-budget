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
    getAll.onsuccess = function() {

        if (getAll.result.length > 0) {
        fetch('/api/transaction', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }

            const transaction = db.transaction(['new_transaction'], 'readwrite');
            const transactionObjectStore = transaction.objectStore('new_transaction');

            transactionObjectStore.clear();

            alert('All saved transactions have been submitted!');
            })
            .catch(err => {
            console.log(err);
            });
        }
    }
};

window.addEventListener('online', uploadTransactions);