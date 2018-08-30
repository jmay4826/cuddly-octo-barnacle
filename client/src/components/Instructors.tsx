import * as React from "react";

const Instructors = ({ instructors }: { instructors: IUser[] }) => (
  <div>
    {instructors.map(instructor => (
      <h1 key={instructor.id}>{instructor.name}</h1>
    ))}
  </div>
);

export { Instructors };
