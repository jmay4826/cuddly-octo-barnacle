import * as React from "react";
import { Student } from "./Student";

const Students = ({
  students,
  socket
}: {
  students: IUser[];
  socket: SocketIOClientStatic["Socket"];
}) => (
  <div>
    <h2>Students</h2>
    <ul className="students-list">
      {students.map(student => (
        <Student
          key={student.id}
          editable={false}
          student={student}
          socket={socket}
        />
      ))}
    </ul>
  </div>
);

export { Students };
