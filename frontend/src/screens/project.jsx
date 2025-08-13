import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import { UserContext } from "../context/user.context.jsx";
import Markdown from "markdown-to-jsx";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const { user } = useContext(UserContext);
  const messageBox = useRef();

  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({
    "app.js": { content: `const express=require('express');` },
    "package.json": { content: `{\n  "name":"temp-server"\n}` },
  });
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const handleUserSelect = (id) => {
    setSelectedUserId((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return Array.from(newSet);
    });
  };

  function handleAddCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: selectedUserId,
      })
      .then(() => setIsModalOpen(false))
      .catch((error) => console.error("Error adding users:", error));
  }

  function send() {
    if (!message.trim()) return;
    sendMessage("project-message", { message, sender: user });
    setMessages((prev) => [...prev, { sender: user, message }]);
    setMessage("");
  }

  useEffect(() => {
    initializeSocket(project._id);

    receiveMessage("project-message", (data) => {
      if (data.message.fileTree) {
        setFileTree(data.message.fileTree);
      }
      setMessages((prev) => [...prev, { sender: data.sender, message: data.message }]);
    });

    axios.get("/users/all").then((res) => setUsers(res.data.allUsers));
    axios.get(`/projects/get-project/${location.state.project._id}`).then((res) => {
      setProject(res.data.project);
    });
  }, []);

  return (
    <main className="h-screen w-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* LEFT CHAT PANEL */}
      <section className="relative h-full w-1/3 min-w-[320px] flex flex-col bg-white/80 backdrop-blur-sm shadow-2xl border-r border-white/50">
        {/* Enhanced Header */}
        <header className="flex justify-between items-center p-5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-xl relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-y-12"></div>
          </div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i className="ri-code-box-fill text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-lg">{project.name || 'Project'}</h1>
              <p className="text-xs text-white/80">Collaborative Workspace</p>
            </div>
          </div>
          
          <div className="relative z-10 flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm hover:scale-105 active:scale-95"
            >
              <i className="ri-user-add-fill"></i>
              <span className="text-sm font-medium">Add</span>
            </button>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm hover:scale-105 active:scale-95 relative"
            >
              <i className="ri-group-fill text-lg"></i>
              {project.users?.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 text-xs font-bold rounded-full flex items-center justify-center text-green-900">
                  {project.users.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Enhanced Messages */}
        <div
          ref={messageBox}
          className="flex-1 overflow-auto p-5 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50 backdrop-blur-sm custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <i className="ri-chat-3-fill text-2xl text-violet-500"></i>
              </div>
              <p className="text-center">Start collaborating with your team!</p>
              <p className="text-xs text-center mt-1">Send a message to begin the conversation</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[75%] transform transition-all duration-300 hover:scale-[1.02] ${
                  msg.sender._id === user._id ? "ml-auto" : "mr-auto"
                }`}
              >
                <div
                  className={`p-2 rounded-2xl shadow-lg backdrop-blur-sm relative ${
                    msg.sender._id === user._id
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white ml-4"
                      : "bg-white/90 text-gray-800 mr-4 border border-gray-100"
                  }`}
                >
                  {/* Message tail */}
                  <div
                    className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                      msg.sender._id === user._id
                        ? "-left-1.5 bg-gradient-to-br from-emerald-500 to-teal-600"
                        : "-right-1.5 bg-white border-r border-b border-gray-100"
                    }`}
                  ></div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        msg.sender._id === user._id
                          ? "bg-white/20 text-white"
                          : "bg-gradient-to-br from-violet-500 to-indigo-500 text-white"
                      }`}
                    >
                      {msg.sender.email?.[0]?.toUpperCase() || "?"}
                    </div>
                    <small
                      className={`text-xs font-medium ${
                        msg.sender._id === user._id ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {msg.sender.email}
                    </small>
                  </div>
                  
                  <div className="leading-relaxed">
                    {msg.sender._id === "ai" ? (
                      <Markdown
                        options={{
                          overrides: { code: { component: SyntaxHighlightedCode } },
                        }}
                      >
                        {msg.message}
                      </Markdown>
                    ) : (
                      msg.message
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Enhanced Input */}
        <div className="flex border-t border-gray-200/50 bg-white/80 backdrop-blur-sm p-4">
          <div className="flex-1 relative">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && send()}
              className="w-full px-4 py-3 pr-12 outline-none text-gray-800 bg-gray-100/80 rounded-2xl border-2 border-transparent focus:border-violet-300 focus:bg-white transition-all duration-200 placeholder-gray-500"
              placeholder="Type your message..."
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <i className="ri-emotion-line"></i>
            </div>
          </div>
          <button
            onClick={send}
            disabled={!message.trim()}
            className="ml-3 px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-2xl hover:from-violet-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg"
          >
            <i className="ri-send-plane-fill text-lg"></i>
          </button>
        </div>

        {/* Enhanced Side Panel */}
        <div
          className={`absolute inset-y-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-2xl transform transition-all duration-500 ease-out z-20 ${
            isSidePanelOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          }`}
        >
          <header className="flex justify-between items-center p-5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <i className="ri-team-fill text-xl"></i>
              </div>
              <div>
                <span className="font-bold text-lg">Team Members</span>
                <p className="text-xs text-white/80">{project.users?.length || 0} collaborators</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSidePanelOpen(false)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <i className="ri-close-fill text-xl"></i>
            </button>
          </header>
          <div className="p-5 space-y-3">
            {project.users?.map((u, index) => (
              <div
                key={u._id}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-full font-bold text-lg shadow-lg">
                    {u.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{u.name || u.email?.split('@')[0]}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </div>
                <div className="text-gray-400">
                  <i className="ri-more-2-fill"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RIGHT CODE EDITOR PANEL */}
      <section className="flex-1 flex bg-gray-900/95 backdrop-blur-sm">
        {/* Enhanced File Explorer */}
        <div className="w-64 bg-gray-800/90 backdrop-blur-sm border-r border-gray-700/50 shadow-2xl">
          <div className="p-4 border-b border-gray-700/50 bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <i className="ri-folder-fill text-white text-sm"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Explorer</h3>
                <p className="text-gray-400 text-xs">{Object.keys(fileTree).length} files</p>
              </div>
            </div>
          </div>
          
          <div className="custom-scrollbar overflow-y-auto max-h-full">
            {Object.keys(fileTree).map((file, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentFile(file);
                  setOpenFiles((prev) => [...new Set([...prev, file])]);
                }}
                className={`w-full text-left px-4 py-3 border-b border-gray-700/30 hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-3 group ${
                  currentFile === file ? "bg-violet-600/20 border-r-2 border-violet-500" : ""
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                  file.endsWith('.js') ? 'bg-yellow-500/20 text-yellow-400' :
                  file.endsWith('.json') ? 'bg-green-500/20 text-green-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  <i className={`${
                    file.endsWith('.js') ? 'ri-javascript-fill' :
                    file.endsWith('.json') ? 'ri-file-code-fill' :
                    'ri-file-fill'
                  }`}></i>
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors font-mono text-sm">
                  {file}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Editor */}
        {currentFile ? (
          <div className="flex flex-col flex-1">
            {/* Enhanced Tabs */}
            <div className="flex bg-gray-800/90 border-b border-gray-700/50 backdrop-blur-sm overflow-x-auto">
              {openFiles.map((file, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentFile(file)}
                  className={`px-6 py-3 text-sm font-mono flex items-center gap-2 transition-all duration-200 border-b-2 whitespace-nowrap ${
                    currentFile === file
                      ? "bg-gray-900 text-violet-400 border-violet-500"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50 border-transparent"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white`}></div>
                  {file}
                  <button className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded p-0.5">
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </button>
              ))}
            </div>
            
            {/* Code Editor */}
            <div className="flex-1 relative">
              <textarea
                value={fileTree[currentFile]?.content}
                onChange={(e) =>
                  setFileTree({
                    ...fileTree,
                    [currentFile]: { content: e.target.value },
                  })
                }
                className="w-full h-full p-6 bg-gray-900 text-blue-200 font-mono text-sm outline-none resize-none leading-relaxed"
                style={{ tabSize: 2 }}
                placeholder="Start coding..."
              />
              
              {/* Line numbers background effect */}
              {/* <div className="absolute top-0 left-0 w-12 h-full bg-gray-800/50 border-r border-gray-700/50 pointer-events-none"></div> */}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-500">
              <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <i className="ri-file-code-fill text-3xl text-gray-600"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">No file selected</h3>
              <p className="text-sm">Choose a file from the explorer to start editing</p>
            </div>
          </div>
        )}
      </section>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform animate-in slide-in-from-bottom-4 duration-300">
            <header className="flex justify-between items-center p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <i className="ri-user-add-fill text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Add Collaborators</h2>
                  <p className="text-sm text-white/80">Invite team members to join</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <i className="ri-close-fill text-xl"></i>
              </button>
            </header>
            
            <div className="p-6">
              <ul className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {users.map((u, index) => (
                  <li
                    key={u._id}
                    onClick={() => handleUserSelect(u._id)}
                    className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] ${
                      selectedUserId.includes(u._id)
                        ? "bg-gradient-to-r from-violet-100 to-indigo-100 border-2 border-violet-300 shadow-lg"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-full font-bold shadow-lg">
                        {u.email?.[0]?.toUpperCase() || "?"}
                      </div>
                      {selectedUserId.includes(u._id) && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                          <i className="ri-check-fill text-white text-xs"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{u.name || u.email?.split('@')[0]}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCollaborators}
                  disabled={selectedUserId.length === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                >
                  Add {selectedUserId.length > 0 && `(${selectedUserId.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
        
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-in {
          animation: animate-in 0.2s ease-out forwards;
        }
      `}</style>
    </main>
  );
};

export default Project;