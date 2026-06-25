import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "https://rajstore.onrender.com/api";
      await axios.post(`${baseUrl}/contact/submit`, formData);
      addToast('Message sent successfully!', 'success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mt-5 mb-5">
      <div className="row align-items-center gy-4">
        <div className="col-lg-6">
          <h1>Contact RajStore</h1>
          <p className="text-muted">
            Have a question or need help with an order? Our customer experience team is here for you.
          </p>
          <div className="card p-4 shadow-sm">
            <h5>Get in touch</h5>
            <p className="mb-2">
              Email us at <a href="mailto:rajj94380@gmail.com">rajj94380@gmail.com</a>
            </p>
            <p className="small text-muted mb-2">Tip: Click the email link to open your mail client and send a message directly. Replies you send from your email will go to the user's address.</p>
            <p className="mb-2">Call us: +91 98765 43210</p>
            <p className="mb-0">Our support team is available Monday to Friday, 9am to 6pm.</p>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="p-4 bg-light rounded-4 shadow-sm">
            <h2>Send us a message</h2>
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <input
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
              <input
                className="form-control"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
                required
              />
              <textarea
                className="form-control"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message"
                rows="4"
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
