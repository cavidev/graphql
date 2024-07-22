import { randomInt } from "crypto";
import fs from "node:fs";

export async function savePersons(persons, updatePersons) {
  try {
    fs.writeFileSync("users.json", JSON.stringify(persons, null, 2), "utf-8");
    if (updatePersons) updatePersons(persons);
    console.log("✔️ Datos actualizados en users.json");
  } catch (error) {
    console.error("❌ Error escribiendo en el archivo:", error);
  }
}

async function api() {
  try {
    const response = await fetch("https://randomuser.me/api?results=200");
    if (!response.ok) {
      throw new Error("Error en la solicitud: " + response.statusText);
    }
    const data = await response.json();
    const users = data.results;
    const formattedData = users.map((user) => ({
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
    // const jsonData = JSON.stringify(formattedData, null, 2);
    //fs.writeFileSync("users.json", jsonData, "utf-8");
    savePersons(JSON.stringify(formattedData, null, 2));
    return formattedData;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function fetchData() {
  try {
    const data = fs.readFileSync("users.json", "utf-8");
    const users = JSON.parse(data);
    if (!users.lenght) throw new Error("The files is empty");
    return users;
  } catch (error) {
    console.error("Error leyendo el archivo:", error);
    return api();
  }
}
