import { ApolloServer, UserInputError, gql } from "apollo-server";
import { fetchData, savePersons } from "./api.js";
import { v1 as uuid } from "uuid";

let persons = await fetchData();
const updatePersons = (pUpdated) => {
  persons = pUpdated;
};

const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }

  type Location {
    city: String
    state: String
    coutry: String
  }

  type Person {
    id: ID!
    name: String!
    phone: String
    location: [Location]
    email: String!
    age: Int
    canDrink: Boolean
    check: String
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(name: String!, phone: String, email: String!): Person
    deletePerson(name: String!): Person
    editNumber(name: String!, phone: String!): Person
  }
`;

// The resolver help us to modify and encapsulate the data, acording with the UI needs it.
// The data can come from database, other API and more...
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: (_, args) => {
      if (!args.phone) return persons;
      const byPhone = (person) =>
        args.phone === "YES" ? person.phone : !person.phone;
      return persons.filter(byPhone);
    },
    findPerson: (_, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },
  // Creating fields
  Person: {
    canDrink: (root) => root.age > 18, // You can create a new field with the previous data
    check: () => "✔️",
  },
  Mutation: {
    // This is the way how you can add a new data in the database
    addPerson: (_, args) => {
      const person = { ...args };
      // Throw a custome message if the person is not unique
      if (persons.find((p) => p.name === person.name)) {
        throw new UserInputError("The person was previous added", {
          invalidArgs: args.name,
        });
      }
      // This can be a database call.
      persons.push({ ...person, id: uuid(), age: crypto.randomInt(15, 50) });
      savePersons(persons, updatePersons);

      // we need to return the person, if you want.
      return person;
    },
    deletePerson: (_, args) => {
      const person = { ...args };
      if (persons.find((p) => p.name === person.name)) {
        savePersons(
          persons.filter((p) => p.name !== person.name),
          updatePersons
        );
        return person;
      }
      throw new UserInputError("The person was not fount", {
        invalidArgs: args.name,
      });
    },
    editNumber: (_, args) => {
      const personIndex = persons.findIndex((p) => p.name === args.name);
      if (personIndex === -1) return null;
      const person = persons[personIndex];
      const updatedPerson = { ...person, phone: args.phone };
      persons[personIndex] = updatedPerson;
      updatePersons(persons);
      return updatedPerson;
    },
  },
};

// Now we are creating a server, same as a Express
const server = new ApolloServer({
  typeDefs, // wrtie the Def
  resolvers, // write the resolver
});

// Running
server.listen().then(({ url }) => {
  console.log(`🚀 Server is running ${url}`);
});
