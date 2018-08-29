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

interface IStudent {
  status: string;
  classroom: string | number;
  id: string;
  instructor: boolean;
  name: string;
  raisedHand: boolean;
}

const flushallAsync = promisify(client.flushall).bind(client) as () => Promise<
  string
>;
const hgetallAsync = promisify(client.hgetall).bind(client) as (
  key: string
) => Promise<{ [key: string]: string }>;
const hmsetAsync = promisify(client.hmset).bind(client) as (
  hash: string | number,
  values: object
) => Promise<boolean>;
const hgetAsync = promisify(client.hget).bind(client) as (
  key: string,
  field: string
) => Promise<string>;
const sremAsync = promisify(client.srem).bind(client) as (
  hash: string,
  ...values: string[]
) => Promise<number>;
const saddAsync = promisify(client.sadd).bind(client) as (
  key: string | number,
  ...members: string[]
) => Promise<number>;
const smembersAsync = promisify(client.smembers).bind(client) as (
  key: string | number
) => Promise<string[]>;

flushallAsync();

const isNumeric = (value: any) => !isNaN(value - parseFloat(value));

const convertDataTypes = async (input: object) => {
  const obj = await input;

  const converted = Object.keys(obj).reduce(async (acc: object, key) => {
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

const getAllUsersByClassroom = (classroom: string | number) =>
  smembersAsync(classroom).then(
    async (users: string[]) =>
      Promise.all(
        users.map(async user => hgetallAsync(user)).map(convertDataTypes)
      ) as Promise<IStudent[]>
  );

io.on("connection", socket => {
  socket.on("join classroom", (user: IStudent) => {
    socket.join(user.classroom.toString());
    if (user.instructor) {
      socket.join(user.classroom + "-instructors");
    }
    hmsetAsync(socket.id, user).catch(console.log);
    saddAsync(user.classroom, socket.id)
      .then(_ => getAllUsersByClassroom(user.classroom))
      .then(users => {
        io.to(user.classroom.toString()).emit("new user", users);
      });
  });

  socket.on("disconnect", async reason => {
    const classroom = await hgetAsync(socket.id, "classroom");

    client.del(socket.id, console.log);
    sremAsync(classroom, socket.id)
      .then(result => getAllUsersByClassroom(classroom))
      .then(users => io.to(classroom).emit("new user", users))
      .catch(console.log);
  });

  socket.on("update user", user => {
    hmsetAsync(user.id, user)
      .then(result => getAllUsersByClassroom(user.classroom))
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
