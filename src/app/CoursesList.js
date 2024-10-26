import { useState, useEffect } from 'react';

function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseNames = async () => {
      try {
        const response = await fetch('/api/getCourseList'); // Call the new API endpoint
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const courseNames = await response.json(); // Parse the JSON response
        setCourses(courseNames); // Set the course names in the state
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseNames();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container">
      <h1 className="title">CSULB Course Chatbots</h1>
      <div className="course-grid">
        {courses.length > 0 ? (
          courses.map((name, index) => (
            <div key={index} className="course-card">
              <img src="default-icon.png" alt="icon" className="course-icon" />
              <h2 className="course-name">{name}</h2>
              <p className="course-description">Assistant for {name}</p>
            </div>
          ))
        ) : (
          <div>No courses available</div>
        )}
      </div>
    </div>
  );
}

export default CoursesList;
