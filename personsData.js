import { randomInt } from "crypto";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const persons = [
  {
    age: randomInt(16, 22),
    name: "John",
    lastName: "Doe",
    phone: 1234,
    street: "fake",
    city: "New York",
    id: generateUUID(),
  },
  {
    age: randomInt(16, 22),
    name: "Jane",
    lastName: "Smith",
    phone: 98987,
    street: "fake",
    city: "Los Angeles",
    id: generateUUID(),
  },
  {
    age: randomInt(16, 22),
    name: "Alice",
    lastName: "Jonhson",
    phone: 5551,
    street: "fake",
    city: "Chicago",
    id: generateUUID(),
  },
  {
    age: randomInt(16, 22),
    name: "Bob",
    lastName: "Brown",
    phone: 4449,
    street: "fake",
    city: "Houston",
    id: generateUUID(),
  },
  {
    age: randomInt(16, 22),
    name: "Charlie",
    lastName: "Davis",
    phone: 3336,
    street: "fake",
    city: "Phoenix",
    id: generateUUID(),
  },
];

export default persons;
