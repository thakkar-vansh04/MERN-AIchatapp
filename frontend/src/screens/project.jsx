import React, { useState,useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import { initializeSocket,receiveMessage,sendMessage } from "../config/socket";
import { UserContext } from "../context/user.context.jsx";

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [ users, setUsers ] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message , setMessage] = useState('');
  const {user} = useContext(UserContext);
  const messageBox = React.createRef();

  const handleUserSelect = (id) => {
    
    setSelectedUserId((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id); // Deselect if already selected
      } else {
        newSelected.add(id); // Select if not already selected
      }
      
      return Array.from(newSelected);
    });  

  };

function handleAddCollaborators() {

  axios.put("/projects/add-user", {
    projectId: location.state.project._id,
    users: selectedUserId,
  })
  .then((response) => {
    console.log("Users added to project:", response.data);
    setIsModalOpen(false);
  })
  .catch((error) => {
    console.error("Error adding users to project:", error);
  });
}

function send(){
  sendMessage('project-message',{
    message,
    sender:user
  })

if(message){
  appendOutgoingMessage(message);
}

  setMessage("");
}

  useEffect(() => {

    initializeSocket(project._id);

    receiveMessage('project-message',data=>{
      console.log(data)
      appendIncomingMessage(data)
    })

    

    axios.get("/users/all")
      .then((response) => {
        setUsers(response.data.allUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });

      axios.get(`/projects/get-project/${location.state.project._id}`)
      .then((response) => {
        console.log("Project fetched:", response.data.project);
        setProject(response.data.project);
      })
      .catch((error) => {
        console.error("Error fetching project:", error);
      }); 

  }, []);

  function appendIncomingMessage(messageObject){
    const messageBox= document.querySelector('.message-box');

    const message = document.createElement('div');
    message.classList.add('message','max-w-56','flex','flex-col','p-2','bg-white','rounded-md','shadow-sm');
    message.innerHTML=`
              <small className="text-xs text-black">
                <u>${messageObject.sender.email}</u>
              </small>
              <p className="text-sm ">${messageObject.message}</p>
            </div>
            `
    messageBox.appendChild(message);
    scrollToBottom();
  }

 function scrollToBottom() {
        messageBox.current.scrollTop = messageBox.current.scrollHeight
    }

  function appendOutgoingMessage(messageObject){
    const messageBox= document.querySelector('.message-box');

    const message = document.createElement('div');
    message.classList.add('message','ml-auto','max-w-56','flex','flex-col','p-2','bg-white','rounded-md','shadow-sm');
    
    message.innerHTML=`
              <small className="text-xs text-black">
                <u>${user.email}</u>
              </small>
              <p className="text-sm ">${messageObject}</p>
            </div>
            `
    messageBox.appendChild(message);
    scrollToBottom();
  }


  return (
    <main className="h-screen w-screen flex">
      <section className="left relative h-screen min-w-72 bg-blue-700 flex flex-col ">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-300 shadow-md absolute top-0 z-10">
          <button
            className="flex gap-2 hover:bg-slate-100 rounded-md p-1.5"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-user-add-fill"></i>
            <p className="font-semibold text-slate-800">Add Collaborators</p>
          </button>

          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 bg-slate-300 rounded-md hover:bg-slate-100 transition-colors duration-200 text-slate-600 flex items-center justify-center"
          >
            <i className="ri-group-fill text-slate-800"></i>
          </button>
        </header>

        <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
          <div ref={messageBox}
            className="message-box p-2 flex-grow flex flex-col gap-2 overflow-auto max-h-full scrollbar-hide">
          </div>
          
          <div className="inputField w-full flex absolute bottom-0">
            <input
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
              className="p-2 px-4 border-none outline-none bg-slate-100 flex-grow"
              placeholder="Enter message"
            />
            <button onClick={send} 
            className="send-button px-3 bg-slate-100">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div
          className={`sidePanel w-full h-full bg-slate-300 absolute ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0 transition-transform duration-300 ease-in-out flex flex-col gap-2`}
        >
          <header className="flex justify-between p-2 px-4 bg-blue-600">
            <div className="flex justify-center items-center text-white text-lg font-semibold">Collaborators</div>
            <button
              className="p-2 bg-blue-600 rounded-md transition-colors duration-200"
              onClick={() => setIsSidePanelOpen(false)}
            >
              <i className="ri-close-fill text-white"></i>
            </button>
            
          </header>

          <div className="users flex flex-col px-2 gap-2">
            {project.users && project.users.map((user) => (
              <div
                key={user._id}
                className="user flex items-center gap-2 p-2 bg-white rounded-md shadow-sm"
              >
                <div className="relative w-8 h-8 flex items-center justify-center text-white bg-slate-600 rounded-full">
                  <i className="ri-user-fill"></i>
                </div>
                <span>{user.email}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-72 p-4 relative">
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Select Collaborators</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsModalOpen(false)}
              >
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <ul className="users-list space-y-2 max-h-72 overflow-y-auto">
              {users.map((user) => (
                <li
                  key={user.id}
                  className={`p-2 bg-gray-100 rounded-md hover:bg-gray-400 ${
                    Array.from(selectedUserId).indexOf(user._id) != -1
                      ? "bg-gray-400 border-2 border-black"
                      : ""
                  } cursor-pointer`}
                  onClick={() => handleUserSelect(user._id)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="relative w-8 h-8 flex items-center justify-center text-white bg-slate-600 rounded-full">
                      <i className="ri-user-fill"></i>
                    </div>
                    <span>{user.email}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div 
            onClick={handleAddCollaborators}
            className="flex justify-center">
              <button className="mt-4 p-2  bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors duration-200">
                Add Collaborators
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;