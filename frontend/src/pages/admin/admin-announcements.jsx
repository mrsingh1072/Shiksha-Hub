import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadAnnouncements = async () => {
    try {
      const response = await adminService.announcements();
      setAnnouncements(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await adminService.createAnnouncement({
        title,
        content,
        audience,
      });

      setTitle("");
      setContent("");
      setAudience("all");
      setMessage("Announcement published successfully.");

      loadAnnouncements();
    } catch (error) {
      setMessage(
        error?.response?.data?.detail || "Failed to publish announcement."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-workspace-hero">
        <div>
          <p className="admin-workspace-hero__eyebrow">COMMUNICATIONS</p>
          <h1>Announcements</h1>
          <p>
            Create, manage and broadcast platform-wide announcements to
            students and teachers.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-metric-grid">
        <div className="admin-metric-card">
          <h4>Total Announcements</h4>
          <strong>{announcements.length}</strong>
        </div>

        <div className="admin-metric-card">
          <h4>Audience Groups</h4>
          <strong>3</strong>
        </div>

        <div className="admin-metric-card">
          <h4>Published</h4>
          <strong>{announcements.length}</strong>
        </div>

        <div className="admin-metric-card">
          <h4>Status</h4>
          <strong>Active</strong>
        </div>
      </div>

      {/* Form */}
      <div className="admin-panel">
        <div className="admin-panel__header">
          <h2>Create Announcement</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label>Title</label>
            <input
              className="admin-input"
              type="text"
              placeholder="Enter announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>Audience</label>
            <select
              className="admin-select"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>Message</label>
            <textarea
              className="admin-textarea"
              rows="6"
              placeholder="Write announcement..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="admin-btn"
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish Announcement"}
          </button>

          {message && (
            <p style={{ marginTop: "12px" }}>
              {message}
            </p>
          )}
        </form>
      </div>

      {/* History */}
      <div className="admin-panel">
        <div className="admin-panel__header">
          <h2>Announcement History</h2>
        </div>

        {announcements.length === 0 ? (
          <p>No announcements available.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Audience</th>
                <th>Message</th>
              </tr>
            </thead>

            <tbody>
              {announcements.map((item) => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td>{item.audience}</td>
                  <td>{item.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}