import { ApolloServer, gql } from "apollo-server";
import persons from "./personsData.js";

const typeDefs = gql`
  type Address {
    street: String!
    city: String!
  }

  type Person {
    age: Int
    canDrink: Boolean
    name: String!
    completeName: String!
    phone: Int!
    street: String!
    check: String!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person]!
    findPerson(name: String!): Person
  }
`;

// The resolver help us to modify and encapsulate the data, acording with the UI needs it.
// The data can come from database, other API and more...
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },
  // Creating fields
  Person: {
    canDrink: (root) => root.age > 18, // You can create a new field with the previous data
    completeName: (root) => `${root.name} ${root.lastName}`,
    check: () => "Carlos",
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
