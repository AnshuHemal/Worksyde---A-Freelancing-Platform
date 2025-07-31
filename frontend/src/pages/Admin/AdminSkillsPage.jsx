import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AiOutlineDelete } from "react-icons/ai";
import { HiPlus } from "react-icons/hi2";
import { TbEdit } from "react-icons/tb";

const AdminSkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editedSkillName, setEditedSkillName] = useState("");

  const API_URL = "http://localhost:5000/api/auth";

  // Fetch skills
  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-skills/`);
      if (response.data.success) {
        setSkills(response.data.skills);
      }
    } catch (error) {
      toast.error("Error fetching skills: " + error.message);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/delete-skill/${id}/`);
      if (response.data.success) {
        toast.success("Skill deleted successfully");
        setSkills(skills.filter((skill) => skill._id !== id));
      } else {
        toast.error("Failed to delete skill");
      }
    } catch (error) {
      toast.error("Error deleting skill: " + error.message);
    }
    setConfirmDeleteId(null); // close confirmation
  };

  // Handle Add Skill
  const handleAddSkill = async () => {
    if (!newSkillName.trim()) {
      return toast.error("Skill name cannot be empty.");
    }

    try {
      const response = await axios.post(`${API_URL}/add-skill/`, {
        name: newSkillName.trim(),
      });

      if (response.status === 201) {
        toast.success("Skill added successfully");
        setSkills([...skills, response.data.skill]);
        setNewSkillName("");
        setIsAdding(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add skill");
    }
  };

  const handleUpdateSkill = async (id) => {
    if (!editedSkillName.trim()) {
      return toast.error("Skill name cannot be empty.");
    }

    try {
      const response = await axios.put(`${API_URL}/update-skill/${id}/`, {
        name: editedSkillName.trim(),
      });

      if (response.status === 200) {
        toast.success("Skill updated successfully");
        setSkills(
          skills.map((skill) =>
            skill._id === id ? response.data.skill : skill
          )
        );
        setEditingSkillId(null);
        setEditedSkillName("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update skill");
    }
  };

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="about-one-heading-text text-start" style={{fontWeight: 'normal'}}>
          Skills{" "}
          <span
            style={{ color: "#121212", fontWeight: "500", fontSize: "18px" }}
          >
            ({skills.length || 256})
          </span>
        </h4>

        <button
          className="login-button border-0" style={{fontSize: '16px'}}
          onClick={() => setIsAdding(true)}
        >
          <HiPlus style={{ height: "20px", width: "20px" }} /> Add New Skill
        </button>
      </div>

      {isAdding && (
        <div className="mt-3 ps-3 d-flex align-items-center gap-2">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Enter skill name"
            className="input-field"
            style={{ width: "200px", fontSize: "15px" }}
          />
          <button className="post-button" onClick={handleAddSkill}>
            Add
          </button>
          <button
            className="post-button"
            onClick={() => {
              setIsAdding(false);
              setNewSkillName("");
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <hr className="my-3" />

      <div className="d-flex justify-content-between px-3 gap-2">
        <h5 style={{color: '#007476'}}>Name</h5>
        <input
          type="text"
          className="input-field p-0"
          placeholder="Search skills..."
          style={{ width: "200px", fontSize: "17px" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p className="m-0" style={{color: '#007476'}}>Actions</p>
      </div>

      {filteredSkills.map((skill) => (
        <div key={skill._id}>
          <div className="d-flex justify-content-between ps-3 mt-3 align-items-center">
            {editingSkillId === skill._id ? (
              <>
                <div>
                  <input
                    type="text"
                    value={editedSkillName}
                    onChange={(e) => setEditedSkillName(e.target.value)}
                    className="input-field"
                    style={{ width: "200px", fontSize: "15px" }}
                  />

                  <button
                    className="post-button ms-2"
                    onClick={() => handleUpdateSkill(skill._id)}
                  >
                    Update
                  </button>
                  <button
                    className="post-button ms-2"
                    onClick={() => {
                      setEditingSkillId(null);
                      setEditedSkillName("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <h5>{skill.name}</h5>
            )}

            <div>
              {confirmDeleteId === skill._id ? (
                <>
                  <span
                    className="me-2 text-danger1"
                    style={{ fontWeight: "500" }}
                  >
                    Delete `{skill.name}`?
                  </span>
                  <button
                    className="post-button me-2"
                    onClick={() => handleDelete(skill._id)}
                  >
                    Yes
                  </button>
                  <button
                    className="post-button"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    No
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="close-button border-0"
                    onClick={() => {
                      setEditingSkillId(skill._id);
                      setEditedSkillName(skill.name);
                    }}
                  >
                    <TbEdit style={{ width: "25px", height: "20px" }} />
                  </button>

                  <button
                    className="close-button border-0"
                    onClick={() => setConfirmDeleteId(skill._id)}
                  >
                    <AiOutlineDelete
                      style={{ width: "25px", height: "20px" }}
                    />
                  </button>
                </>
              )}
            </div>
          </div>
          <hr className="mx-2 mt-2" />
        </div>
      ))}
    </div>
  );
};

export default AdminSkillsPage;
