"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CardComponent from './CardComponent';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserInterfaceProps {
  backendName: string; // e.g., "flask"
}

const UserInterface: React.FC<UserInterfaceProps> = ({ backendName }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [updateUser, setUpdateUser] = useState({ id: '', name: '', email: '' });
  
  // Hydration protection: ensures client code matches server layout on initial boot
  const [isMounted, setIsMounted] = useState(false);

  // Map backend names to exact, full Tailwind class strings so they don't get tree-shaken
  const backgroundColors: Record<string, string> = {
    flask: 'bg-blue-600',
    express: 'bg-green-600',
    go: 'bg-cyan-600',
  };

  const buttonColors: Record<string, string> = {
    flask: 'bg-blue-800 hover:bg-blue-700',
    express: 'bg-green-800 hover:bg-green-700',
    go: 'bg-cyan-800 hover:bg-cyan-700',
  };

  const bgColor = backgroundColors[backendName.toLowerCase()] || 'bg-gray-200';
  const btnColor = buttonColors[backendName.toLowerCase()] || 'bg-gray-600 hover:bg-gray-500';

  // Fetch all users from the backend framework route
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/${backendName}/users`);
      // Use slice().reverse() to safely order by newest first without mutating backend data arrays
      setUsers(Array.isArray(response.data) ? response.data.slice().reverse() : []);
    } catch (error) {
      console.error('Error fetching data from backend:', error);
    }
  }, [backendName, apiUrl]);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, [fetchData]);

  // Create a new user record
  const createUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    try {
      const response = await axios.post(`${apiUrl}/api/${backendName}/users`, newUser);
      setUsers((prevUsers) => [response.data, ...prevUsers]);
      setNewUser({ name: '', email: '' });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Update an existing user record
  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const targetId = parseInt(updateUser.id);
    if (isNaN(targetId)) return;

    try {
      await axios.put(`${apiUrl}/api/${backendName}/users/${targetId}`, { 
        name: updateUser.name, 
        email: updateUser.email 
      });
      
      setUsers((prevUsers) =>
        prevUsers.map((user) => 
          user.id === targetId 
            ? { ...user, name: updateUser.name, email: updateUser.email } 
            : user
        )
      );
      setUpdateUser({ id: '', name: '', email: '' });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Delete a user record
  const deleteUser = async (userId: number) => {
    try {
      await axios.delete(`${apiUrl}/api/${backendName}/users/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Block server rendering completely to avoid any Next.js hydration mismatches
  if (!isMounted) {
    return null; 
  }

  return (
    <div className={`user-interface ${bgColor} w-full max-w-md p-6 my-4 rounded-xl shadow-lg text-white transition-all`}>
      {/* Dynamic framework logo */}
      <div className="w-20 h-20 mb-4 mx-auto flex items-center justify-center bg-white rounded-full overflow-hidden">
        <img 
          src={`/${backendName.toLowerCase()}logo.svg`} 
          alt={`${backendName} Logo`} 
          className="w-12 h-12 object-contain"
          onError={(e) => {
            // Hides broken image icon if public asset /flasklogo.svg doesn't exist yet
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      
      <h2 className="text-2xl font-black text-center mb-6 tracking-wide">
        {`${backendName.charAt(0).toUpperCase() + backendName.slice(1)} Backend`}
      </h2>

      {/* Form: Create User */}
      <form onSubmit={createUser} className="mb-5 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 shadow-inner">
        <h3 className="text-sm font-semibold mb-3 text-white/80 uppercase tracking-wider">Add New User</h3>
        <input
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="mb-2 w-full p-2.5 bg-white rounded text-black outline-none border-none text-sm placeholder-gray-400 shadow-sm"
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="mb-3 w-full p-2.5 bg-white rounded text-black outline-none border-none text-sm placeholder-gray-400 shadow-sm"
          required
        />
        <button type="submit" className={`w-full p-2.5 text-white font-bold rounded text-sm transition-colors cursor-pointer shadow ${btnColor}`}>
          Add User
        </button>
      </form>

      {/* Form: Update User */}
      <form onSubmit={handleUpdateUser} className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 shadow-inner">
        <h3 className="text-sm font-semibold mb-3 text-white/80 uppercase tracking-wider">Update Existing User</h3>
        <input
          placeholder="User ID (Number)"
          value={updateUser.id}
          onChange={(e) => setUpdateUser({ ...updateUser, id: e.target.value })}
          className="mb-2 w-full p-2.5 bg-white rounded text-black outline-none border-none text-sm placeholder-gray-400 shadow-sm"
          required
        />
        <input
          placeholder="New Name"
          value={updateUser.name}
          onChange={(e) => setUpdateUser({ ...updateUser, name: e.target.value })}
          className="mb-2 w-full p-2.5 bg-white rounded text-black outline-none border-none text-sm placeholder-gray-400 shadow-sm"
          required
        />
        <input
          placeholder="New Email"
          type="email"
          value={updateUser.email}
          onChange={(e) => setUpdateUser({ ...updateUser, email: e.target.value })}
          className="mb-3 w-full p-2.5 bg-white rounded text-black outline-none border-none text-sm placeholder-gray-400 shadow-sm"
          required
        />
        <button type="submit" className="w-full p-2.5 text-white font-bold bg-emerald-700 hover:bg-emerald-600 rounded text-sm transition-colors cursor-pointer shadow">
          Update User
        </button>
      </form>

      {/* Render User Data Feed */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider px-1">Active Database Entries</h3>
        {users.length === 0 ? (
          <p className="text-center text-sm text-white/60 py-4 bg-white/5 rounded-lg border border-dashed border-white/10">No records found. Add a user above!</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="flex items-center justify-between bg-white text-black p-4 rounded-lg shadow-md gap-4">
              <div className="overflow-hidden min-w-0 flex-1">
                <CardComponent card={user} />
              </div>
              <button 
                onClick={() => deleteUser(user.id)} 
                className={`${btnColor} text-white font-medium py-1.5 px-3 rounded text-xs whitespace-nowrap transition-colors cursor-pointer shadow-sm`}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserInterface;