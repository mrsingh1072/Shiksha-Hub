import { useEffect, useState } from "react";
import {
  getAvailableClasses,
  requestClass,
} from "../../services/studentDashboardService";
import { useNavigate } from "react-router-dom";

export default function StudentClasses() {
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await getAvailableClasses();
      setClasses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const requestJoin = async (classCode) => {
    try {
      await requestClass(classCode);

      alert("Join request sent successfully.");

      loadClasses();
    } catch (err) {
      alert(err.response?.data?.detail || "Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Available Classes
        </h1>

        <p className="text-gray-500">
          Request to join a teacher's class.
        </p>
      </div>

      <div className="grid gap-5">

        {classes.map((cls) => (

          <div
            key={cls._id}
            className="bg-white border rounded-xl p-6 flex justify-between items-center"
          >

            <div>

              <h2 className="text-xl font-bold">
                {cls.class_name}
              </h2>

              <p className="text-gray-500">
                {cls.subject}
              </p>

              <p className="text-sm mt-2">
                Semester: {cls.semester}
              </p>

              <p className="text-sm">
                Section: {cls.section}
              </p>

            </div>

            {cls.status === "available" && (
  <button
    onClick={() => requestJoin(cls.class_code)}
    className="bg-green-primary text-white px-5 py-2 rounded-lg"
  >
    Request Join
  </button>
)}

{cls.status === "pending" && (
  <button
    disabled
    className="bg-yellow-500 text-white px-5 py-2 rounded-lg cursor-not-allowed"
  >
    Pending Approval
  </button>
)}

{cls.status === "joined" && (
  <button
    onClick={() => navigate(`/student/classes/${cls._id}`)}
    className="bg-green-primary text-white px-5 py-2 rounded-lg"
  >
    Open Classroom
  </button>
)}

          </div>

        ))}

      </div>

    </div>
  );
}