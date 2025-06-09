import React, { useContext,useState,useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setprojectName] = useState(null);
  const [project, setProject] = useState([]);
  const navigate = useNavigate();

  function handleCreateProject(e) {
    e.preventDefault();
    console.log({projectName});

    axios.post("/projects/create", { name: projectName })
      .then((response) => {
        console.log(response.data);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error("Error creating project:", error);
      });
  }

  useEffect(() => {
    axios.get("/projects/all")
      .then((response) => {
        // console.log("Projects fetched successfully:", response.data);
        setProject(response.data.projects);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  }, []);

  return (
    <main className="p-4">
      <h1>Welcone to project management app</h1>
      <div className="projects flex flex-wrap gap-3">
        <button onClick={()=>{setIsModalOpen(true)}} className="project mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Create Project<i className="ri-sticky-note-add-line ml-2"></i>
        </button>

{
  project.map((project) => (
          <div key={project._id} 
            onClick={() => navigate(`/project`, { state: { project } })}
            className="project flex flex-col gap-2 cursor-pointer mt-4 p-4 border rounded-md shadow-sm hover:bg-slate-200 min-w-52 transition-shadow">
            <h2 className="font-semibold">{project.name}</h2>
            
            <div className="flex gap-2">
              <p><small><i className="ri-user-line"></i> Collaborators: </small></p>
              {project.users.length}
            </div>
          </div>  
  ))
}

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md w-1/3">
            <h2 className="text-xl mb-4">Create New Project</h2>
            <form
              onSubmit={handleCreateProject}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  type="text"
                  onChange={(e) => setprojectName(e.target.value)}
                  value={projectName}
                  placeholder="Enter project name"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        onClick={() => setIsModalOpen(true)}
      >
        Create Project
      </button> */}
    </main>
  );
};

export default Home;
