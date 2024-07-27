import { randomInt } from "crypto";

const formatUsers = (users) => {
  return users.map((user) => ({
    id: user.login.uuid,
    name: `${user.name.title}. ${user.name.first} ${user.name.last}`,
    age: randomInt(15, 40),
    phone: user.phone,
    location: {
      city: user.location.city,
      state: user.location.state,
      coutry: user.location.coutry,
    },
    email: user.email,
  }));
};

export default formatUsers;
