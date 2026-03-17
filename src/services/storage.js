// Simple in-memory storage for demo purposes.
// Replace this with a database layer in production.

const store = {
  cars: [],
  customers: [],
  rentals: [],
};

let nextId = 1;

export function generateId() {
  return String(nextId++);
}

export function getStore(collection) {
  return store[collection];
}

export function findById(collection, id) {
  const items = store[collection];
  return items.find((item) => item.id === id);
}

export function removeById(collection, id) {
  const items = store[collection];
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  return items.splice(index, 1)[0];
}

export function resetStore() {
  store.cars = [];
  store.customers = [];
  store.rentals = [];
  nextId = 1;
}
