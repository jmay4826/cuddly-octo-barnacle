import * as React from "react";

const Instructors = ({ instructors }: { instructors: IUser[] }) => (
  <div>
    <h1>Instructors</h1>
    {instructors.map(instructor => (
      <h3 key={instructor.id}>{instructor.name}</h3>
    ))}
  </div>
);

export { Instructors };
