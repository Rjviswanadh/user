const express = require("express");
app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");
let db = null;
const bcrypt = require("bcrypt");
app.use(express.json());
const installRun = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen("5000", () => {
      console.log("server running at 5000....");
    });
  } catch (e) {
    console.log(e.massage);
  }
};
installRun();
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  // console.log(request.body);
  const convertPassword = await bcrypt.hash(password, 10);

  const checkUser = `select * from User where username="${username}"`;
  const result = await db.get(checkUser);
  // console.log(result);
  if (result === undefined) {
    const alreadyRegistered = `insert into user(username,name,password,gender,location) 
      values("${username}","${name}","${convertPassword}",
      "${gender}","${location}")`;
    if (password.length < 6) {
      response.send("Password is too short");
      response.status(400);
    } else {
      const result1 = await db.run(alreadyRegistered);
      console.log(result1);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const getUser = `select * from user where username = "${username}" `;
  const result2 = await db.get(getUser);
  if (result2 !== undefined) {
    const decodePassword = await bcrypt.compare(password, result2.password);
    //  console.log(decodePassword)
    if (decodePassword === true) {
      response.send("Login success!");
      response.status(200);
    } else {
      response.send("Invalid password");
      response.status(400);
    }
  } else {
    response.send("Invalid user");
    response.status(400);
  }
});
app.put("/change-password/", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const getUserPassword = `select* from user where username='${username}'`;
  const getting = await db.get(getUserPassword);
  if (getting !== undefined) {
    const convertPassword = await bcrypt.compare(oldPassword, getting.password);
    if (convertPassword === false) {
      response.send("Invalid current password");
      response.status(400);
    } else {
      if (newPassword.length < 6) {
        response.send("Password is too short");
        response.status(400);
      } else {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const changePassword = `update user set password="${hashedNewPassword}"`;
        const result3 = await db.run(changePassword);
        response.send("Password updated");
        response.status(200);
      }
    }
  } else {
    response.send("user does not exits");
  }
});
module.exports = app;
