import * as React from "react";
import { Name } from "./Name";
import { StatusBar } from "./StatusBar";

const Student = ({
  student,
  socket,
  editable
}: {
  student: IStudent;
  socket: SocketIOClientStatic["Socket"];
  editable: boolean;
}) => (
  <li className="student-container" key={student.id}>
    <StatusBar student={student} editable={editable} socket={socket} />
    <Name student={student} editable={editable} socket={socket} />
  </li>
);
export { Student };
