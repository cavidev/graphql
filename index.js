import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";
import { fetchData, saveInFile, UsersAPI } from "./api.js";
import formatUsers from "./utils/formatUsers.js";
import { v1 as uuid } from "uuid";

let persons = await fetchData();
const updateInMemory = (pUpdated) => {
  persons = pUpdated;
};

const typeDefs = `#graphql
  enum YesNo {
    YES
    NO
  }

  type Location {
    city: String!
    state: String
  }

  type Person {
    id: ID!
    name: String!
    phone: String
    location: Location
    email: String!
    age: Int
    canDrink: Boolean
    check: String
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo, update: YesNo, count: String): [Person]!
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
    allPersons: async (_, args, { dataSources }) => {
      if (Object.keys(args).length === 0) return persons;
      if (args.phone) {
        const byPhone = (person) =>
          args.phone === "YES" ? person.phone : !person.phone;
        return persons.filter(byPhone);
      }
      if (args.update === "YES") {
        // calling API dataSources by graphql 4
        const data = await dataSources.usersAPI.getUsers(args.count || "100");
        updateInMemory(formatUsers(data.results));
      }

      return persons;
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
        throw new GraphQLError("User was added, please change the name...", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      // This can be a database call.
      persons.push({ ...person, id: uuid(), age: crypto.randomInt(15, 50) });
      saveInFile(persons, updateInMemory);

      // we need to return the person, if you want.
      return person;
    },
    deletePerson: (_, args) => {
      const person = { ...args };
      if (persons.find((p) => p.name === person.name)) {
        saveInFile(
          persons.filter((p) => p.name !== person.name),
          updateInMemory
        );
        return person;
      }
      throw new GraphQLError("The person was not fount", {
        extensions: {
          code: "BAD_USER_INPUT",
        },
      });
    },
    editNumber: (_, args) => {
      const personIndex = persons.findIndex((p) => p.name === args.name);
      if (personIndex === -1) return null;
      const person = persons[personIndex];
      const updatedPerson = { ...person, phone: args.phone };
      persons[personIndex] = updatedPerson;
      updateInMemory(persons);
      return updatedPerson;
    },
  },
};

// Now we are creating a server, same as a Express
const server = new ApolloServer({
  typeDefs, // wrtie the Def
  resolvers, // write the resolver
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async () => {
    const { cache } = server;
    return {
      // We create new instances of our data sources with each request,
      // passing in our server's cache.
      dataSources: {
        usersAPI: new UsersAPI({ cache }),
      },
    };
  },
});

console.log(`🚀  Server ready at: ${url}`);
