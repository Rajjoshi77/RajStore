import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="eyebrow">About MAISON ARCA</p>
          <h1>Building a smarter, more trusted way to shop online.</h1>
          <p className="about-hero-description">
            MAISON ARCA combines thoughtful design with professional service.
            We help shoppers discover premium products, trusted brands, and seamless delivery—backed by attentive service and thoughtful curation.
          </p>
          <div className="about-hero-actions">
            <Link className="primary-btn" to="/products">Explore Products</Link>
            <Link className="secondary-btn" to="/register">Join MAISON ARCA</Link>
          </div>
        </div>

        <div className="about-hero-visual">
          <div className="about-chip-card">
            <span className="chip-label">Connected Commerce</span>
            <div className="chip-box">
              <div className="chip-line" />
              <div className="chip-node" />
            </div>
            <p>Intelligent product discovery, tailored recommendations, and secure checkout all in one platform.</p>
          </div>
        </div>
      </section>

      <section className="about-values">
        <h2>Our vision for modern retail</h2>
        <div className="value-grid">
          <article className="value-card">
            <h3>Customer confidence</h3>
            <p>Every interaction is designed to feel transparent, trusted, and easy—so customers return with confidence.</p>
          </article>
          <article className="value-card">
            <h3>Data-driven growth</h3>
            <p>We unlock growth through smarter merchandising, intelligent product placement, and analytics-led experience design.</p>
          </article>
          <article className="value-card">
            <h3>Fast delivery</h3>
            <p>Speed is part of our promise: fast order confirmation, efficient fulfillment, and smooth delivery tracking.</p>
          </article>
        </div>
      </section>

      <section className="about-story">
        <div className="story-copy">
          <p className="eyebrow">Our story</p>
          <h2>Crafting a future-proof shopping experience</h2>
          <p>
            MAISON ARCA started with a simple idea: make every shopper feel empowered by design without sacrificing a human touch.
            Today, our team blends professional service with modern design to deliver an e-commerce experience that feels fast, safe, and inspired.
          </p>
        </div>
        <div className="story-list">
          <div className="story-item">
            <span>01</span>
            <div>
              <h4>Quality first</h4>
              <p>We select products carefully and present them clearly, so customers can buy with confidence.</p>
            </div>
          </div>
          <div className="story-item">
            <span>02</span>
            <div>
              <h4>Tech-enabled service</h4>
              <p>Automation and personalization help us serve every shopper faster and more accurately.</p>
            </div>
          </div>
          <div className="story-item">
            <span>03</span>
            <div>
              <h4>Always evolving</h4>
              <p>We invest in modern tools, feedback, and design to keep MAISON ARCA ahead of customer expectations.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
