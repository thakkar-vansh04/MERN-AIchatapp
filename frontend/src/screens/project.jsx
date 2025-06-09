import React, { useState } from "react";
import { useLocation } from "react-router-dom";
const Project = () => {
  const location = useLocation();
  console.log("Project location state:", location.state);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  return (
    <main className="h-screen w-screen flex">
      <section className="left h-full min-w-72 bg-blue-700 flex flex-col relative">
        <header className="flex justify-end p-2 px-4 w-full bg-slate-300 shadow-md">
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 bg-slate-300 rounded-md hover:bg-slate-100 transition-colors duration-200 text-slate-600 flex items-center justify-center"
          >Collaborators
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col ">
          <div className="message-box p-2 flex-grow flex flex-col gap-2">
            <div className="incoming max-w-56 flex flex-col bg-white p-2 rounded-md w-fit shadow-sm">
              <small className="text-xs">
                <u>example@gmail.com</u>
              </small>
              <p className="text-sm ">Lorem ipsum dolor sit amet.</p>
            </div>
            <div className="max-w-56 ml-auto flex flex-col bg-white p-2 rounded-md w-fit shadow-sm">
              <small className="text-xs">
                <u>example@gmail.com</u>
              </small>
              <p className="text-sm">Lorem ipsum dolor sit amet.</p>
            </div>
          </div>
          <div className="inputField w-full flex">
            <input
              className="p-2 px-4 border-none outline-none bg-slate-100"
              type="text"
              placeholder="Enter message"
            />
            <button className="send-button flex-grow p-3 bg-slate-100">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div className={`sidePanel w-full h-full bg-slate-300 absolute ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0 transition-transform duration-300 ease-in-out flex flex-col gap-2`}>
            <header className="flex justify-end p-2 px-4 bg-blue-600">
                <button className="p-2 bg-blue-600 rounded-md transition-colors duration-200"
                onClick={() => setIsSidePanelOpen(false)}>
                    <i className="ri-close-fill text-white"></i>
                </button>
            </header>

          <div className="users flex flex-col gap-2">
            <div className="user flex items-center mx-1.5 gap-2 p-2 bg-white rounded-md shadow-sm cursor-pointer hover:bg-slate-100 overflow-y-auto p">
                

                <div className="aspect-square rounded-full ml-1 w-fit h-fit p-5 flex items-center justify-center text-white bg-blue-600">
                    <i className ="ri-user-fill absolute "></i>
                </div>
                <h1 className="text-lg font-semibold">Username</h1>

              </div>
          </div>
              
        </div>
      </section>
    </main>
  );
};

export default Project;
