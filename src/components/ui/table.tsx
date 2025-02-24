import React from "react";

export const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="w-full border-collapse border border-gray-200">{children}</table>
);

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-100">{children}</thead>
);

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);

export const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b border-gray-200">{children}</tr>
);

export const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th className="p-3 text-left">{children}</th>
);

export const TableCell = ({
  children,
  colSpan,
  className = "",
}: {
  children: React.ReactNode;
  colSpan?: number; 
  className?: string;
}) => (
  <td colSpan={colSpan} className={`p-3 ${className}`}>
    {children}
  </td>
);

