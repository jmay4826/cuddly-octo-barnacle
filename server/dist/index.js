"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const handy_redis_1 = require("handy-redis");
const http_1 = require("http");
const socketIO = require("socket.io");
const app = express();
const http = new http_1.Server(app);
const io = socketIO(http);
const client = handy_redis_1.createHandyClient();
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
const filterUsers = (users) => {
    const students = users.filter(({ instructor }) => !instructor);
    const instructors = users.filter(({ instructor }) => instructor);
    return { students, instructors };
};
const objToArray = (input) => {
    const obj = input;
    const result = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result.push([key, obj[key].toString()]);
        }
    }
    return result;
};
const convertBooleans = async (input) => {
    const obj = await input;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (obj[key] === "true") {
                obj[key] = true;
            }
            else if (obj[key] === "false") {
                obj[key] = false;
            }
        }
    }
    return obj;
};
const getAllUsersByClassroom = (classroom) => client
    .smembers(classroom)
    .then(async (users) => Promise.all(users.map(async (user) => client.hgetall(user)).map(convertBooleans)));
io.on("connection", socket => {
    socket.on("join classroom", (user) => {
        socket.join(user.classroom.toString());
        if (user.instructor) {
            socket.join(user.classroom + "-instructors");
        }
        client.hmset(socket.id, ...objToArray(user)).catch(console.log);
        client
            .sadd(user.classroom, socket.id)
            .then(_ => getAllUsersByClassroom(user.classroom))
            .then(users => io.to(user.classroom.toString()).emit("new user", filterUsers(users)));
    });
    socket.on("disconnect", async (reason) => {
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
//# sourceMappingURL=index.js.map