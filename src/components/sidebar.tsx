import React, { useState } from "react";
import { FiHome, FiBarChart2, FiBox, FiCreditCard, FiUsers, FiMenu } from "react-icons/fi";
import Link from "next/link";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`bg-gray-100 h-screen p-4 transition-all duration-300 ${isOpen ? "w-60" : "w-16"}`}>
        {/* Toggle Button */}
        <button className="mb-4 text-gray-700 focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
          <FiMenu size={24} />
        </button>

        {/* Sidebar Links */}
        <ul className="space-y-4">
          <li>
            <Link href="/dashboard" className="flex items-center space-x-3 text-gray-700 hover:text-blue-500">
              <FiHome size={20} />
              {isOpen && <span>Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link href="/reports" className="flex items-center space-x-3 text-gray-700 hover:text-blue-500">
              <FiBarChart2 size={20} />
              {isOpen && <span>Reports</span>}
            </Link>
          </li>
          <li>
            <Link href="/products" className="flex items-center space-x-3 text-gray-700 hover:text-blue-500">
              <FiBox size={20} />
              {isOpen && <span>Products</span>}
            </Link>
          </li>
          <li>
            <Link href="/transactions" className="flex items-center space-x-3 text-gray-700 hover:text-blue-500">
              <FiCreditCard size={20} />
              {isOpen && <span>Transactions</span>}
            </Link>
          </li>
          <li>
            <Link href="/users" className="flex items-center space-x-3 text-gray-700 hover:text-blue-500">
              <FiUsers size={20} />
              {isOpen && <span>Users</span>}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
