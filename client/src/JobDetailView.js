import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./JobDetailView.css";
import uploadFileIcon from "./upload_file.png";

const JobDetailView = () => {
  const { id } = useParams();
  const location = useLocation();
  const fromApplications = location.state?.fromApplications || false;
  const [jobDetails, setJobDetails] = useState(null);
  const [error, setError] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState("");
  const [isFavourite, setIsFavourite] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const filledStar = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="gold"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
    >
      <path d="M12 .587l3.668 7.568 8.332 1.201-6.036 5.636 1.422 8.233L12 18.897l-7.386 3.865 1.422-8.233-6.036-5.636 8.332-1.201z" />
    </svg>
  );
  
  const emptyStar = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="gold"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
    >
      <path d="M12 .587l3.668 7.568 8.332 1.201-6.036 5.636 1.422 8.233L12 18.897l-7.386 3.865 1.422-8.233-6.036-5.636 8.332-1.201z" />
    </svg>
  );



  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch("http://localhost:3000/job-posts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch job details");
        }

        const data = await response.json();
        const job = data.find((job) => job.id === parseInt(id));

        if (!job) {
          throw new Error("Job not found");
        }

        setJobDetails(job);
        checkIfFavourite(job.id);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching job details:", error);
      }
    };

    const checkIfFavourite = async (jobId) => {
      try {
        const response = await fetch(`http://localhost:3000/job-posts/favourite`, {
          method: "GET",
          headers: {
            "X-CSRF-Token": localStorage.getItem("token"),
          },
          credentials: "include",
        });
    
        if (response.ok) {
          const favouritePosts = await response.json();
          const isFav = favouritePosts.some(post => post.id === jobId);
          setIsFavourite(isFav);
        }
      } catch (error) {
        console.error('Error checking favourite status:', error);
      }
    };
    

    fetchJobDetails();
  }, [id]);

  const addToFavourites = async () => {
    try {
      const response = await fetch("http://localhost:3000/job-posts/favourite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": localStorage.getItem("token"),
        },
        credentials: "include",
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setIsFavourite(true);
      } else {
        throw new Error("Failed to add to favourites");
      }
    } catch (error) {
      console.error("Error adding to favourites:", error);
    }
  };

  const removeFromFavourites = async () => {
    try {
      const response = await fetch("http://localhost:3000/job-posts/favourite", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": localStorage.getItem("token"),
        },
        credentials: "include",
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setIsFavourite(false);
      } else {
        throw new Error("Failed to remove from favourites");
      }
    } catch (error) {
      console.error("Error removing from favourites:", error);
    }
  };

  const handleFileChange = (e) => {
    setCvFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setCvFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleApply = async (withCV = false) => {
    if (!cvFile && !withCV) {
      setApplicationStatus("Please upload a CV file.");
      return;
    }

    const formData = new FormData();
    formData.append("id", id.toString());
    formData.append("cv", cvFile);

    user.cv = true;
    localStorage.setItem("user", JSON.stringify(user));

    try {
      const response = await fetch("http://localhost:3000/job-applications", {
        method: "POST",
        headers: {
          "X-CSRF-Token": localStorage.getItem("token"),
        },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("Server error response:", errorResponse);
        throw new Error("Failed to apply for job");
      }

      setApplicationStatus("Application submitted successfully!");
    } catch (error) {
      setApplicationStatus("Error submitting application.");
      console.error("Error applying for job:", error);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!jobDetails) {
    return <div>Loading...</div>;
  }

  const isAuthor = user && jobDetails.author.id === user.id;

  return (
    <div className="job-detail-container">
      <div className="job-header">
        <h1>{jobDetails.title}</h1>
        <div className="salary-container">
          <span className="salary">${jobDetails.salary}</span>
        </div>
        <div
          onClick={isFavourite ? removeFromFavourites : addToFavourites}
          style={{ cursor: 'pointer' }}
          aria-label={isFavourite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
        >
          {isFavourite ? filledStar : emptyStar}
        </div>
      </div>

      <div className="job-content">
        <div className="job-detail-info">
          <img
            src={`http://localhost:3000/logo/${jobDetails.logo}`}
            alt={`${jobDetails.companyName} logo`}
          />
          <p>
            <strong>Company:</strong> {jobDetails.companyName}
          </p>
          <p>
            <strong>Location:</strong> {jobDetails.location}
          </p>
          <p>
            <strong>Level:</strong> {jobDetails.level.level}
          </p>
          <p>
            <strong>Contract Type:</strong> {jobDetails.contractType.type}
          </p>
          <p>
            <strong>Posted by:</strong> {jobDetails.author.username}
          </p>
        </div>
        <div className="job-languages">
          <h3>Required Languages:</h3>
          {jobDetails.languages.map((language) => (
            <span key={language.id} className="job-language">
              {language.language}
            </span>
          ))}
        </div>
      </div>

      <div className="job-description">
        <h3>Description:</h3>
        <p>{jobDetails.description}</p>
      </div>

      {isAuthor ? (
        <div className="author-message">
          <p>You cannot apply for your own job posting.</p>
        </div>
      ) : (
        !fromApplications && (
          <div className="application-section">
            <h3>Apply for this Job</h3>
            {user ? (
              user.cv ? (
                <>
                  <button
                    className="apply-btn"
                    onClick={() => handleApply(true)}
                  >
                    Apply with current CV
                  </button>
                  <hr className="application-section__divider"></hr>
                  <label
                    htmlFor="cvUpload"
                    className="file-input-label"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <img
                      src={uploadFileIcon}
                      alt="Upload icon"
                      width="54"
                      height="44"
                    />
                    {cvFile ? (
                      <p>{cvFile.name}</p>
                    ) : (
                      <p>
                        Drag and drop your CV here or click to upload (PDF only)
                      </p>
                    )}
                    <input
                      id="cvUpload"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                  </label>
                  <button className="apply-btn" onClick={() => handleApply()}>
                    Apply
                  </button>
                </>
              ) : (
                <>
                  <label
                    htmlFor="cvUpload"
                    className="file-input-label"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <img
                      src={uploadFileIcon}
                      alt="Upload icon"
                      width="54"
                      height="44"
                    />
                    {cvFile ? (
                      <p>{cvFile.name}</p>
                    ) : (
                      <p>
                        Drag and drop your CV here or click to upload (PDF only)
                      </p>
                    )}
                    <input
                      id="cvUpload"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                  </label>
                  <button className="apply-btn" onClick={handleApply}>
                    Apply
                  </button>
                </>
              )
            ) : (
              <p>You must be logged in to apply for this job.</p>
            )}
            {applicationStatus && <p>{applicationStatus}</p>}
          </div>
        )
      )}
    </div>
  );
};

export default JobDetailView;
