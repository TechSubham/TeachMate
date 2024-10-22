import React from "react";

const page = () => {
  return (
    <div>
      <div className="bg-blue-600 h-12 flex justify-around ">
        <div>
          <div className="mt-2 text-white text-2xl">TeachMate</div>
        </div>
        <div className="flex space-x-10 mt-2 text-white text-xl">
          <div>Home</div>
          <div>Courses</div>
          <div>Mentors</div>
          <div>Profile</div>
        </div>
      </div>
    </div>
  );
};

export default page;
