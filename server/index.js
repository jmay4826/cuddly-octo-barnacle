require("dotenv").config();
const { promisify } = require("util");
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const redis = require("redis");
const client = redis.createClient();
const hgetallAsync = promisify(client.hgetall).bind(client);
const lrangeAsync = promisify(client.lrange).bind(client);
const hmsetAsync = promisify(client.hmset).bind(client);
const rpushAsync = promisify(client.rpush).bind(client);
const hgetAsync = promisify(client.hget).bind(client);
const sremAsync = promisify(client.srem).bind(client);
const saddAsync = promisify(client.sadd).bind(client);
const smembersAsync = promisify(client.smembers).bind(client);

let classrooms = {};
let questions = [];

const objToArr = obj => {
  const result = [];
  for (let key in obj) {
    result.push(key, obj[key]);
  }
  console.log(result);
  return result;
};

const isNumeric = value => !isNaN(value - parseFloat(value));

const convertDataTypes = async obj => {
  console.log(await obj);
  const converted = { ...(await obj) };
  for (let key in converted) {
    if (isNumeric(converted[key])) {
      converted[key] = +converted[key];
    } else if (converted[key] === "false") {
      converted[key] = false;
    } else if (converted[key] === "true") {
      converted[key] = true;
    }
  }
  // console.log(converted);
  return converted;
};

const getAllUsersByClassroom = classroom => {
  console.log(classroom);
  return smembersAsync(classroom).then(async users => {
    console.log(await users);
    return Promise.all(
      users.map(async user => hgetallAsync(user)).map(convertDataTypes)
    );
  });
};

io.on("connection", socket => {
  socket.on("join classroom", user => {
    socket.join(user.classroom);
    hmsetAsync(socket.id, objToArr(user)).catch(console.log);
    saddAsync(user.classroom, socket.id)
      .then(_ => getAllUsersByClassroom(user.classroom))
      .then(users => {
        io.to(user.classroom).emit("new user", users);
      });
  });

  socket.on("disconnect", async reason => {
    let classroom = await hgetAsync(socket.id, "classroom");

    client.del(socket.id, console.log);
    sremAsync(classroom, 0, socket.id)
      .then(result => getAllUsersByClassroom(classroom))
      .then(users => io.to(classroom).emit("new user", users))
      .catch(console.log);
  });

  socket.on("update user", user => {
    hmsetAsync(user.id, objToArr(user))
      .then(result => {
        console.log(result);
        return getAllUsersByClassroom(user.classroom);
      })
      .then(users => {
        if (user.id === socket.id) {
          socket.emit("update user", user);
        }
        io.to(user.classroom).emit("new user", users);
      })
      .catch(console.log);
  });

  // socket.on("join classroom instructor", ({ classroom, name }) => {
  //   room = classroom;
  //   classrooms[room] = classrooms[room] || { users: [], instructors: [] };
  //   socket.join(room);
  //   classrooms[room].instructors = [
  //     ...classrooms[room].instructors,
  //     { id: socket.id, name }
  //   ];
  //   io.to(room).emit("new instructor", classrooms[room].instructors);
  // });

  // socket.on("editUsername", username => {
  //   currentClassroom.users.find(
  //     user => currentUser.id === user.id
  //   ).name = username;
  //   socket.emit("userList", currentClassroom.users);
  //   socket.broadcast.emit("userList", currentClassroom.users);
  // });
  // socket.on("raiseHand", () =>
  //   socket.to(`${currentClassroom}-admin`).emit("raisedHand")
  // );
  // socket.on("moved", newPosition => (position = newPosition));
  // socket.on("disconnect", reason => {
  //   if (!currentClassroom.users) return;
  //   currentClassroom.users.splice(
  //     currentClassroom.users.findIndex(user => currentUser.id === user.id),
  //     1
  //   );
  //   console.log(users);
  //   socket.broadcast.emit("userList", currentClassroom.users);
  // });
});

http.listen(3001, () => {
  console.log("listening on 3000");
});
