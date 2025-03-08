import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">Inventory Analytics Dashboard</h1>
      <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        Back to Homepage
      </Link>
    </nav>
  );
};

export default Navbar;
