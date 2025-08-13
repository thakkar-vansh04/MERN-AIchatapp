import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setprojectName] = useState("");
  const [project, setProject] = useState([]);
  const navigate = useNavigate();

  function handleCreateProject(e) {
    e.preventDefault();
    axios
      .post("/projects/create", { name: projectName })
      .then(() => {
        setIsModalOpen(false);
        setprojectName("");
        fetchProjects();
      })
      .catch((error) => {
        console.error("Error creating project:", error);
      });
  }

  function fetchProjects() {
    axios
      .get("/projects/all")
      .then((response) => {
        setProject(response.data.projects);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.email || "User"} 👋
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-all duration-200"
        >
          <i className="ri-sticky-note-add-line"></i> Create Project
        </button>
      </header>

      {/* Project Cards */}
      {project.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          No projects yet. Click{" "}
          <span className="text-indigo-600 font-medium cursor-pointer" onClick={() => setIsModalOpen(true)}>
            here
          </span>{" "}
          to create your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.map((proj) => (
            <div
              key={proj._id}
              onClick={() => navigate(`/project`, { state: { project: proj } })}
              className="cursor-pointer bg-white rounded-lg shadow p-5 hover:shadow-lg hover:-translate-y-1 transform transition-all duration-200 group"
            >
              <h2 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600">
                {proj.name}
              </h2>
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                <i className="ri-user-line"></i> Collaborators: {proj.users.length}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  onChange={(e) => setprojectName(e.target.value)}
                  value={projectName}
                  placeholder="Enter project name"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
