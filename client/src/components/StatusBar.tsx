import * as React from "react";

const isActive = (property: string | boolean, value?: string) =>
  property === value || property === true ? "student-status-active" : "";

const raiseHand = (
  student: IUser,
  socket: SocketIOClientStatic["Socket"]
) => () =>
  socket.emit("update user", {
    ...student,
    raisedHand: !student.raisedHand
  });

const updateStatus = (
  student: IUser,
  socket: SocketIOClientStatic["Socket"],
  status: string
) => () => {
  socket.emit("update user", {
    ...student,
    status
  });
};

const StatusBar = ({
  student,
  editable,
  socket
}: {
  student: IUser;
  editable: boolean;
  socket: SocketIOClientStatic["Socket"];
}) => (
  <div className="status-bar">
    <div
      onClick={editable ? raiseHand(student, socket) : undefined}
      className={`student-status ${isActive(student.raisedHand)} ${editable &&
        "editable"}`}
    >
      ?
    </div>

    <div
      onClick={editable ? updateStatus(student, socket, "good") : undefined}
      className={`student-status student-status-good ${isActive(
        student.status,
        "good"
      )} ${editable && "editable"}`}
    />
    <div
      onClick={editable ? updateStatus(student, socket, "ok") : undefined}
      className={`student-status student-status-ok ${isActive(
        student.status,
        "ok"
      )} ${editable && "editable"}`}
    />
    <div
      onClick={editable ? updateStatus(student, socket, "bad") : undefined}
      className={`student-status student-status-bad ${isActive(
        student.status,
        "bad"
      )} ${editable && "editable"}`}
    />
    <div
      onClick={editable ? updateStatus(student, socket, "") : undefined}
      className={`student-status student-status-none ${isActive(
        student.status,
        ""
      )} ${editable && "editable"}`}
    />
  </div>
);
export { StatusBar };
