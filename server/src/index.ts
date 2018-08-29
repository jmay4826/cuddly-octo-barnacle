import * as dotenv from "dotenv";
dotenv.config();
import * as express from "express";
import { Server } from "http";
import * as redis from "redis";
import * as socketIO from "socket.io";
import { promisify } from "util";
const app = express();
const http = new Server(app);
const io = socketIO(http);
const client = redis.createClient();

const flushallAsync = promisify(client.flushall).bind(client);
const hgetallAsync = promisify(client.hgetall).bind(client);
const lrangeAsync = promisify(client.lrange).bind(client);
const hmsetAsync = promisify(client.hmset).bind(client);
const rpushAsync = promisify(client.rpush).bind(client);
const hgetAsync = promisify(client.hget).bind(client);
const sremAsync = promisify(client.srem).bind(client);
const saddAsync = promisify(client.sadd).bind(client);
const smembersAsync = promisify(client.smembers).bind(client);

flushallAsync();

const objToArr = obj =>
  Object.keys(obj).reduce((acc, key) => [...acc, key, obj[key]], []);

const isNumeric = value => !isNaN(value - parseFloat(value));

const convertDataTypes = async input => {
  const obj = await input;

  const converted = Object.keys(obj).reduce(async (acc, key) => {
    const accum = await acc;
    if (isNumeric(obj[key])) {
      return { ...accum, [key]: +obj[key] };
    } else if (obj[key] === "false") {
      return { ...accum, [key]: false };
    } else if (obj[key] === "true") {
      return { ...accum, [key]: true };
    } else {
      return { ...accum, [key]: obj[key] };
    }
  }, {});

  return converted;
};

const getAllUsersByClassroom = classroom =>
  smembersAsync(classroom).then(async users =>
    Promise.all(
      users.map(async user => hgetallAsync(user)).map(convertDataTypes)
    )
  );

io.on("connection", socket => {
  socket.on("join classroom", user => {
    socket.join(user.classroom);
    // if (user.instructor) {
    //   socket.join(user.classroom + "-instructors");
    // }
    hmsetAsync(socket.id, objToArr(user)).catch(console.log);
    saddAsync(user.classroom, socket.id)
      .then(_ => getAllUsersByClassroom(user.classroom))
      .then(users => {
        io.to(user.classroom).emit("new user", users);
      });
  });

  socket.on("disconnect", async reason => {
    const classroom = await hgetAsync(socket.id, "classroom");

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
});

http.listen(3001, () => {
  console.log("listening on 3000");
});
