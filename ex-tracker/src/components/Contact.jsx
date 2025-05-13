import React, { useState } from 'react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can replace this with actual submission logic (e.g., API call)
    alert(`Thank you for contacting us, ${formData.name}!`);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <form onSubmit={handleSubmit} className="contact-form">
        <label htmlFor="name">Name</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name}
          onChange={handleChange}
          required 
        />

        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          name="email" 
          value={formData.email}
          onChange={handleChange}
          required 
        />

        <label htmlFor="message">Message</label>
        <textarea 
          name="message" 
          value={formData.message}
          onChange={handleChange}
          required 
        />

        <button type="submit" className="submit-btn">Send Message</button>
      </form>
    </div>
  );
}

export default Contact;
