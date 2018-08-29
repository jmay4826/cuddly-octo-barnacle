"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const http_1 = require("http");
const redis = require("redis");
const socketIO = require("socket.io");
const util_1 = require("util");
const app = express();
const http = new http_1.Server(app);
const io = socketIO(http);
const client = redis.createClient();
const flushallAsync = util_1.promisify(client.flushall).bind(client);
const hgetallAsync = util_1.promisify(client.hgetall).bind(client);
const hmsetAsync = util_1.promisify(client.hmset).bind(client);
const hgetAsync = util_1.promisify(client.hget).bind(client);
const sremAsync = util_1.promisify(client.srem).bind(client);
const saddAsync = util_1.promisify(client.sadd).bind(client);
const smembersAsync = util_1.promisify(client.smembers).bind(client);
flushallAsync();
const isNumeric = value => !isNaN(value - parseFloat(value));
const convertDataTypes = async (input) => {
    const obj = await input;
    const converted = Object.keys(obj).reduce(async (acc, key) => {
        const accum = await acc;
        if (isNumeric(obj[key])) {
            return Object.assign({}, accum, { [key]: +obj[key] });
        }
        else if (obj[key] === "false") {
            return Object.assign({}, accum, { [key]: false });
        }
        else if (obj[key] === "true") {
            return Object.assign({}, accum, { [key]: true });
        }
        else {
            return Object.assign({}, accum, { [key]: obj[key] });
        }
    }, {});
    return converted;
};
const getAllUsersByClassroom = (classroom) => smembersAsync(classroom).then(async (users) => Promise.all(users.map(async (user) => hgetallAsync(user)).map(convertDataTypes)));
io.on("connection", socket => {
    socket.on("join classroom", user => {
        socket.join(user.classroom);
        // if (user.instructor) {
        //   socket.join(user.classroom + "-instructors");
        // }
        hmsetAsync(socket.id, user).catch(console.log);
        saddAsync(user.classroom, socket.id)
            .then(_ => getAllUsersByClassroom(user.classroom))
            .then(users => {
            io.to(user.classroom).emit("new user", users);
        });
    });
    socket.on("disconnect", async (reason) => {
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
//# sourceMappingURL=index.js.map