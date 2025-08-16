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
    // Reset editing state when component mounts
    setEditingSkillId(null);
    setEditedSkillName("");
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-skills/`, {
        withCredentials: true
      });
      if (response.data.success) {
        console.log('Fetched skills:', response.data.skills);
        setSkills(response.data.skills);
      }
    } catch (error) {
      toast.error("Error fetching skills: " + error.message);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    console.log('Attempting to delete skill with ID:', id);
    try {
      const response = await axios.delete(`${API_URL}/delete-skill/${id}/`, {
        withCredentials: true
      });
      console.log('Delete response:', response);
      if (response.data.success) {
        toast.success("Skill deleted successfully");
        setSkills(skills.filter((skill) => {
          const skillId = skill._id || skill.id;
          return skillId !== id;
        }));
      } else {
        toast.error("Failed to delete skill");
      }
    } catch (error) {
      console.error('Delete error:', error);
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
      }, {
        withCredentials: true
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
      }, {
        withCredentials: true
      });

      if (response.status === 200) {
        toast.success("Skill updated successfully");
        setSkills(
          skills.map((skill) => {
            const skillId = skill._id || skill.id;
            return skillId === id ? response.data.skill : skill;
          })
        );
        console.log('Update successful, clearing editing state');
        setEditingSkillId(null);
        setEditedSkillName("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update skill");
    }
  };

  const handleEditSkill = (skill) => {
    const skillId = skill._id || skill.id;
    console.log('Setting editing skill ID to:', skillId, 'for skill:', skill.name);
    setEditingSkillId(skillId);
    setEditedSkillName(skill.name);
  };

  const handleCancelEdit = () => {
    console.log('Canceling edit, clearing editingSkillId');
    setEditingSkillId(null);
    setEditedSkillName("");
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

      {filteredSkills.map((skill) => {
        // Ensure we're comparing the correct IDs
        const skillId = skill._id || skill.id;
        const isEditing = editingSkillId && skillId && String(editingSkillId) === String(skillId);
        console.log(`Skill "${skill.name}": editingSkillId="${editingSkillId}", skillId="${skillId}", isEditing=${isEditing}`);
        
        return (
        <div key={skillId}>
          <div className="d-flex justify-content-between ps-3 mt-3 align-items-center">
            {isEditing ? (
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
                    onClick={() => handleUpdateSkill(skillId)}
                  >
                    Update
                  </button>
                  <button
                    className="post-button ms-2"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <h5>{skill.name}</h5>
            )}

            <div>
              {confirmDeleteId === skillId ? (
                <>
                  <span
                    className="me-2 text-danger1"
                    style={{ fontWeight: "500" }}
                  >
                    Delete `{skill.name}`?
                  </span>
                  <button
                    className="post-button me-2"
                    onClick={() => {
                      console.log('Confirming delete for skill:', skill.name, 'with ID:', skillId);
                      handleDelete(skillId);
                    }}
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
                    onClick={() => handleEditSkill(skill)}
                  >
                    <TbEdit style={{ width: "25px", height: "20px" }} />
                  </button>

                  <button
                    className="close-button border-0"
                    onClick={() => {
                      console.log('Delete button clicked for skill:', skill.name, 'with ID:', skillId);
                      setConfirmDeleteId(skillId);
                    }}
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
      );
      })}
    </div>
  );
};

export default AdminSkillsPage;
