import fs from "node:fs";
import formatUsers from "./utils/formatUsers";

export async function saveInFile(persons, updateInMemory) {
  try {
    fs.writeFileSync("users.json", JSON.stringify(persons, null, 2), "utf-8");
    if (updateInMemory) updateInMemory(persons);
    console.log("✔️", "Datos actualizados en users.json");
  } catch (error) {
    console.error("❌", "Error escribiendo en el archivo:", error);
  }
}

async function api() {
  try {
    const response = await fetch("https://randomuser.me/api?results=10");
    if (!response.ok) {
      throw new Error("Error en la solicitud: " + response.statusText);
    }
    const data = await response.json();
    const formattedData = formatUsers(data.results);
    saveInFile(formattedData);
    return formattedData;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function fetchData() {
  try {
    const data = fs.readFileSync("users.json", "utf-8");
    const users = JSON.parse(data);
    if (!users.length) throw Error("The files is empty");
    return users;
  } catch (error) {
    console.error("Error leyendo el archivo:", error);
    return api();
  }
}

import { RESTDataSource } from "@apollo/datasource-rest";

export class UsersAPI extends RESTDataSource {
  baseURL = "https://randomuser.me/";

  async getUsers(results) {
    return this.get(`api?results=${results}`);
  }
}
