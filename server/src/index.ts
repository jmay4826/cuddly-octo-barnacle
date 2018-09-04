import * as dotenv from "dotenv";
dotenv.config();
import * as express from "express";
import { createHandyClient } from "handy-redis";
import { Server } from "http";
import * as socketIO from "socket.io";

const app = express();
const http = new Server(app);
const io = socketIO(http);
const client = createHandyClient();

interface IUser {
  status: string;
  classroom: string;
  id: string;
  instructor: boolean;
  name: string;
  raisedHand: boolean;
}

// const flushallAsync = promisify(client.flushall).bind(client) as () => Promise<
//   string
// >;
// const hgetallAsync = promisify(client.hgetall).bind(client) as (
//   key: string
// ) => Promise<{ [key: string]: string }>;
// const hmsetAsync = promisify(client.hmset).bind(client) as (
//   hash: string | number,
//   values: object
// ) => Promise<boolean>;
// const hgetAsync = promisify(client.hget).bind(client) as (
//   key: string,
//   field: string
// ) => Promise<string>;
// const sremAsync = promisify(client.srem).bind(client) as (
//   hash: string,
//   ...values: string[]
// ) => Promise<number>;
// const saddAsync = promisify(client.sadd).bind(client) as (
//   key: string | number,
//   ...members: string[]
// ) => Promise<number>;
// const smembersAsync = promisify(client.smembers).bind(client) as (
//   key: string | number
// ) => Promise<string[]>;

// flushallAsync();
client.flushall();

const filterUsers = (users: IUser[]) => {
  const students = users.filter(({ instructor }) => !instructor);
  const instructors = users.filter(({ instructor }) => instructor);
  return { students, instructors };
};

const objToArray = (input: any) => {
  const obj = input;
  const result: Array<[string, string]> = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result.push([key, obj[key].toString()]);
    }
  }
  return result;
};

const convertBooleans = async (input: Promise<{}>) => {
  const obj = await input;

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] === "true") {
        obj[key] = true;
      } else if (obj[key] === "false") {
        obj[key] = false;
      }
    }
  }
  return obj as IUser;
};

const getAllUsersByClassroom = (classroom: string) =>
  client
    .smembers(classroom)
    .then(async (users: string[]) =>
      Promise.all(
        users.map(async user => client.hgetall(user)).map(convertBooleans)
      )
    );

io.on("connection", socket => {
  socket.on("join classroom", (user: IUser) => {
    socket.join(user.classroom.toString());
    if (user.instructor) {
      socket.join(user.classroom + "-instructors");
    }
    client.hmset(socket.id, ...objToArray(user)).catch(console.log);
    client
      .sadd(user.classroom, socket.id)
      .then(_ => getAllUsersByClassroom(user.classroom))
      .then(users =>
        io.to(user.classroom.toString()).emit("new user", filterUsers(users))
      );
  });

  socket.on("disconnect", async reason => {
    const classroom = (await client.hget(socket.id, "classroom")) || "";

    client.del(socket.id);
    client
      .srem(classroom, socket.id)
      .then(result => getAllUsersByClassroom(classroom))
      .then(users => io.to(classroom).emit("new user", filterUsers(users)))
      .catch(console.log);
  });

  socket.on("update user", user => {
    client
      .hmset(user.id, user)
      .then(_ => getAllUsersByClassroom(user.classroom))
      .then(users => {
        io.to(user.classroom).emit("new user", filterUsers(users));
      })
      .catch(console.log);
  });
});

http.listen(3001, () => {
  console.log("listening on 3001");
});
