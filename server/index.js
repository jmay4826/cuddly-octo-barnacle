require("dotenv").config();
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const massive = require("massive");

massive({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
}).then(db => app.set("db", db));

app.get("/", (req, res) => {
  res.send("<h1>Hello</h1>");
});

let users = [];
let classrooms = [];
let questions = [];
let position = {};

io.on("connection", socket => {
  let currentClassroom = {};
  let currentUser = {
    name: "Guest" + Math.floor(Math.random() * 1000000),
    id: socket.id
  };
  socket.emit("position", position);

  socket.on("newClassroom", classroom => {
    let teacherPassword = Math.floor(Math.random() * 100000);
    let studentPassword = Math.floor(Math.random() * 100000);
    classrooms.push({
      id: classroom,
      studentPassword,
      teacherPassword,
      users: []
    });
    socket.emit("passwords", {
      classroom,
      studentPassword,
      teacherPassword
    });
  });

  socket.on("checkPassword", data => {
    console.log(data);
    currentClassroom =
      classrooms.find(classroom => classroom.id == data.classroom) || {};
    console.log(classrooms);
    if (!currentClassroom.id) {
      return socket.emit(
        "authError",
        "Classroom ID not found. Please try again."
      );
    }
    if (data.password == currentClassroom.teacherPassword) {
      socket.emit("authenticated", { authenticated: true, isAdmin: true });
      socket.join(currentClassroom);
      socket.join(`${currentClassroom}-admin`);
      currentClassroom.users = [...currentClassroom.users, currentUser];
      socket.to(currentClassroom).emit("userList", currentClassroom.users);
      socket.emit("userList", currentClassroom.users);
    } else if (data.password == currentClassroom.studentPassword) {
      socket.emit("authenticated", { authenticated: true });
      socket.join(currentClassroom);
      currentClassroom.users = [...currentClassroom.users, currentUser];
      socket.to(currentClassroom).emit("userList", currentClassroom.users);
      socket.emit("userList", currentClassroom.users);
    } else {
      socket.emit("authError", "Password did not match. Please try again.");
    }
  });

  socket.on("editUsername", username => {
    currentClassroom.users.find(
      user => currentUser.id === user.id
    ).name = username;
    socket.emit("userList", currentClassroom.users);
    socket.broadcast.emit("userList", currentClassroom.users);
  });
  socket.on("raiseHand", () =>
    socket.to(`${currentClassroom}-admin`).emit("raisedHand")
  );
  socket.on("moved", newPosition => (position = newPosition));
  socket.on("disconnect", reason => {
    if (!currentClassroom.users) return;
    currentClassroom.users.splice(
      currentClassroom.users.findIndex(user => currentUser.id === user.id),
      1
    );
    console.log(users);
    socket.broadcast.emit("userList", currentClassroom.users);
  });
});

// users.push(currentUser);

// socket.emit("user list", users);
// socket.broadcast.emit("user list", users);

// socket.on("makeAdmin", user => {
//   console.log("admin");
//   socket.join("admin");
// });

// socket.on("question", question => {
//   questions.push(question);
//   socket.emit("question added", question);
//   socket.to("admin").emit("question added", questions);
// });

// socket.on('editName', username => () )

http.listen(3001, () => {
  console.log("listening on 3000");
});
