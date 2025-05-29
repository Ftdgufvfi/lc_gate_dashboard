import React, { useState } from "react";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phoneNumber: "",
    email: "",
    employmentStatus: "",
    occupation: "",
    educationLevel: "",
    raceEthnicity: "",
    nationality: "",
    primaryLanguage: "",
    healthStatus: "",
    smokingStatus: "",
    physicalActivity: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Send form data to the server
    // You can use fetch or axios to send the data to your API endpoint
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Register</h2>

        {/* Personal Information */}
        <section className="form-section">
          <h3>Personal Information</h3>
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <label>Date of Birth:</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />

          <label>Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-Binary">Non-Binary</option>
          </select>

          <label>Marital Status:</label>
          <select
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleChange}
            required
          >
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
            <option value="Other">Other</option>
          </select>
        </section>

        {/* Contact Information */}
        <section className="form-section">
          <h3>Contact Information</h3>
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street Address"
            required
          />

          <label>City:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <label>State/Province:</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />

          <label>ZIP/Postal Code:</label>
          <input
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            required
          />

          <label>Country:</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />

          <label>Phone Number:</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />

          <label>Email Address:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </section>

        {/* Socioeconomic Data */}
        <section className="form-section">
          <h3>Socioeconomic Data</h3>
          <label>Employment Status:</label>
          <select
            name="employmentStatus"
            value={formData.employmentStatus}
            onChange={handleChange}
            required
          >
            <option value="Employed">Employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Retired">Retired</option>
            <option value="Student">Student</option>
            <option value="Other">Other</option>
          </select>

          <label>Occupation/Job Title:</label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
          />

          <label>Education Level:</label>
          <select
            name="educationLevel"
            value={formData.educationLevel}
            onChange={handleChange}
            required
          >
            <option value="No Formal Education">No Formal Education</option>
            <option value="High School">High School</option>
            <option value="Bachelor's Degree">Bachelor's Degree</option>
            <option value="Master's Degree">Master's Degree</option>
            <option value="Doctorate">Doctorate</option>
            <option value="Other">Other</option>
          </select>
        </section>

        {/* Cultural/Ethnic Background */}
        <section className="form-section">
          <h3>Cultural/Ethnic Background</h3>
          <label>Race/Ethnicity:</label>
          <select
            name="raceEthnicity"
            value={formData.raceEthnicity}
            onChange={handleChange}
            required
          >
            <option value="White">White</option>
            <option value="Black/African American">Black/African American</option>
            <option value="Asian">Asian</option>
            <option value="Hispanic/Latino">Hispanic/Latino</option>
            <option value="Native American">Native American</option>
            <option value="Pacific Islander">Pacific Islander</option>
            <option value="Mixed">Mixed</option>
            <option value="Other">Other</option>
          </select>

          <label>Nationality/Citizenship:</label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            required
          />

          <label>Primary Language(s):</label>
          <input
            type="text"
            name="primaryLanguage"
            value={formData.primaryLanguage}
            onChange={handleChange}
            required
          />
        </section>

        {/* Health & Lifestyle */}
        <section className="form-section">
          <h3>Health & Lifestyle</h3>
          <label>Health Status:</label>
          <textarea
            name="healthStatus"
            value={formData.healthStatus}
            onChange={handleChange}
            placeholder="Chronic Conditions, Disabilities, etc."
          />

          <label>Smoking/Alcohol/Drug Use:</label>
          <textarea
            name="smokingStatus"
            value={formData.smokingStatus}
            onChange={handleChange}
            placeholder="Describe any use"
          />

          <label>Physical Activity Level:</label>
          <textarea
            name="physicalActivity"
            value={formData.physicalActivity}
            onChange={handleChange}
            placeholder="Describe activity level"
          />
        </section>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default RegistrationForm;
