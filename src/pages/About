import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Assuming AuthContext provides theme
import { useInView } from 'react-intersection-observer';

// Reusable NavLink Component (Copied from Home.jsx for self-containment, but ideally imported)
const NavLink = ({ label, navigate, path, textColor, accentColor }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (path.startsWith('/#')) {
      const id = path.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
  };
  return (
    <a
      href={path}
      onClick={handleClick}
      style={{
        textDecoration: "none",
        color: textColor,
        fontWeight: "500",
        fontSize: "1rem",
        transition: "color 0.2s ease",
        flexShrink: 0,
        "@media (max-width: 768px)": {
          fontSize: "0.9rem",
        },
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = accentColor)}
      onMouseOut={(e) => (e.currentTarget.style.color = textColor)}
    >
      {label}
    </a>
  );
};

// Reusable FooterLink Component (Copied from Home.jsx for self-containment, but ideally imported)
// Renamed to PolicyLink for clarity when used within main content
const PolicyLink = ({ label, path, accentColor, mutedTextColor, isExternal = false }) => {
  if (isExternal) {
    return (
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: "none",
          color: mutedTextColor,
          fontSize: "0.9rem",
          transition: "color 0.2s ease",
          fontWeight: "bold", // Added for prominence on page
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = accentColor)}
        onMouseOut={(e) => (e.currentTarget.style.color = mutedTextColor)}
      >
        {label}
      </a>
    );
  }
  return (
    <a
      href={path}
      style={{
        textDecoration: "none",
        color: mutedTextColor,
        fontSize: "0.9rem",
        transition: "color 0.2s ease",
        fontWeight: "bold", // Added for prominence on page
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = accentColor)}
      onMouseOut={(e) => (e.currentTarget.style.color = mutedTextColor)}
    >
      {label}
    </a>
  );
};


// Reusable Section with Scroll Animation Component (Copied from Home.jsx for self-containment, but ideally imported)
const SectionWithAnimation = ({ id, theme, accentColor, sectionBgColor, sectionBorderColor, textColor, mutedTextColor, title, children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const animationStyle = {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
  };
  return (
    <section
      id={id}
      ref={ref}
      style={{
        padding: "80px 20px",
        maxWidth: "1200px",
        margin: "60px auto",
        background: sectionBgColor,
        borderRadius: "20px",
        border: `1px solid ${sectionBorderColor}`,
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        ...animationStyle,
      }}
    >
      <h2 style={{ fontSize: "2.8rem", fontWeight: "bold", marginBottom: "50px", textAlign: "center", color: accentColor }}>{title}</h2>
      {children}
    </section>
  );
};


export default function About() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, theme, toggleTheme } = useAuth();

  // Define colors consistent with Home.jsx
  const bgColor = theme === 'dark' ? "#1A222A" : "#F8FBF8";
  const textColor = theme === 'dark' ? "#E0E6EB" : "#303030";
  const accentColor = "#4CAF50";
  const sectionBgColor = theme === 'dark' ? "linear-gradient(145deg, #2A343D, #1F2830)" : "linear-gradient(145deg, #FFFFFF, #F0F5F0)";
  const sectionBorderColor = theme === 'dark' ? "#3A454F" : "#E0E5E0";
  const mutedTextColor = theme === 'dark' ? "#A0A8B0" : "#606060";
  const headerBgColor = theme === 'dark' ? "#1A222A" : "#FFFFFF";
  const headerBorderColor = theme === 'dark' ? "#3A454F" : "#E8EBE8";

  const handleSignInSignUp = () => {
    if (isAuthenticated) navigate("/dashboard");
    else navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor, color: textColor }}>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div style={{ background: bgColor, color: textColor, minHeight: "100vh", fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      {/* Top Navigation Bar - Reused from Home.jsx */}
      <header
        style={{
          width: "100%",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: `1px solid ${headerBorderColor}`,
          background: headerBgColor,
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          "@media (min-width: 768px)": {
            padding: "0 40px",
          },
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/logo.png"
            alt="Pluse CRM Logo"
            style={{ width: "36px", height: "36px", borderRadius: "50%" }}
          />
          <span style={{ fontWeight: "700", fontSize: "24px", color: textColor, letterSpacing: "-0.8px" }}>
            Pluse
          </span>
        </div>
        <nav
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            flexWrap: "nowrap",
            flexShrink: 0,
            "@media (max-width: 768px)": {
              gap: "15px",
            },
            "@media (max-width: 480px)": {
              gap: "10px",
              fontSize: "0.85rem",
            },
          }}
        >
          {/* NavLink for Home, etc. - adjust paths as needed */}
          <NavLink label="Home" navigate={navigate} path="/" textColor={textColor} accentColor={accentColor} />
          <NavLink label="Features" navigate={navigate} path="/#features-section" textColor={textColor} accentColor={accentColor} />
          <NavLink label="Benefits" navigate={navigate} path="/#benefits-section" textColor={textColor} accentColor={accentColor} />
          <NavLink label="Contact" navigate={navigate} path="/contact" textColor={textColor} accentColor={accentColor} /> {/* Updated path for Contact page */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              color: accentColor,
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
          <button
            onClick={handleSignInSignUp}
            style={{
              padding: "10px 22px",
              fontSize: "1rem",
              fontWeight: "bold",
              background: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.3s ease, transform 0.2s ease",
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
              flexShrink: 0,
              "@media (max-width: 480px)": {
                padding: "8px 15px",
                fontSize: "0.9rem",
              },
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#43A047"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = accentColor; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Hero Section for About Page */}
      <section
        style={{
          width: "100%",
          padding: "80px 20px",
          textAlign: "center",
          background: bgColor,
          color: textColor,
          minHeight: "50vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: "bold",
            marginBottom: "25px",
            color: accentColor,
            textShadow: theme === 'dark' ? "none" : "1px 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          About Pluse CRM
        </h1>
        <p
          style={{
            fontSize: "1.3rem",
            lineHeight: "1.7",
            color: mutedTextColor,
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          Empowering you to cultivate stronger, more meaningful relationships.
        </p>
      </section>

      {/* Our Mission Section */}
      <SectionWithAnimation id="our-mission" theme={theme} accentColor={accentColor} sectionBgColor={sectionBgColor} sectionBorderColor={sectionBorderColor} textColor={textColor} mutedTextColor={mutedTextColor} title="Our Mission">
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: mutedTextColor, marginBottom: "20px" }}>
            In an increasingly digital and fast-paced world, genuine human connection can sometimes feel fleeting. Our mission at Pluse CRM is to bridge that gap by providing intuitive, privacy-focused tools that help you remember the small details, nurture your network, and ensure no valuable connection ever falls through the cracks.
          </p>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: mutedTextColor }}>
            We believe that strong relationships are the foundation of personal and professional success, and our platform is designed to make building and maintaining them effortless and enjoyable.
          </p>
        </div>
      </SectionWithAnimation>

      {/* Our Story / Why Pluse CRM Section */}
      <section
        style={{
          padding: "60px 20px",
          maxWidth: "1000px",
          margin: "60px auto",
          textAlign: "center",
          background: bgColor,
          color: textColor,
        }}
      >
        <h2 style={{ fontSize: "2.8rem", fontWeight: "bold", marginBottom: "40px", color: accentColor }}>Why We Built Pluse CRM</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
          <div style={{ background: sectionBgColor, padding: "30px", borderRadius: "15px", border: `1px solid ${sectionBorderColor}`, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
            <h3 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "15px", color: textColor }}>The Challenge</h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: mutedTextColor }}>
              Remembering birthdays, anniversaries, last conversations, or important follow-ups for a growing network can be overwhelming. Generic CRMs are often too complex for personal use, while simple contact apps lack the depth needed for meaningful relationship management.
            </p>
          </div>
          <div style={{ background: sectionBgColor, padding: "30px", borderRadius: "15px", border: `1px solid ${sectionBorderColor}`, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
            <h3 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "15px", color: textColor }}>Our Solution</h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: mutedTextColor }}>
              Pluse CRM was conceived to be the perfect middle ground: a powerful yet intuitive platform that integrates seamlessly with your Google Contacts. It gives you the tools to track interactions, set reminders, and add personalized notes, all without compromising your data privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <SectionWithAnimation id="our-values" theme={theme} accentColor={accentColor} sectionBgColor={sectionBgColor} sectionBorderColor={sectionBorderColor} textColor={textColor} mutedTextColor={mutedTextColor} title="Our Values">
        <div style={{ display: "flex", flexDirection: "column", gap: "25px", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ fontSize: "2rem", color: accentColor }}>🔒</div>
            <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: mutedTextColor }}>
              **Privacy First:** Your data security and privacy are paramount. We do not store your Google Contacts data on our servers.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ fontSize: "2rem", color: accentColor }}>✨</div>
            <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: mutedTextColor }}>
              **User-Centric Design:** We build Pluse CRM with your needs in mind, focusing on intuitive interfaces and powerful features that genuinely enhance your relationship management.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ fontSize: "2rem", color: accentColor }}>🌿</div>
            <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: mutedTextColor }}>
              **Simplicity & Efficiency:** Cut through the clutter. Pluse CRM is designed to be straightforward, helping you achieve more with less effort.
            </p>
          </div>
        </div>
      </SectionWithAnimation>

      {/* Important Policies Section - NEW SECTION */}
      <SectionWithAnimation id="our-policies" theme={theme} accentColor={accentColor} sectionBgColor={sectionBgColor} sectionBorderColor={sectionBorderColor} textColor={textColor} mutedTextColor={mutedTextColor} title="Important Policies">
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: mutedTextColor, maxWidth: "700px", margin: "0 auto" }}>
            Your trust is our priority. Please review our policies to understand how we handle your data and our terms of service.
          </p>
          <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", justifyContent: "center" }}>
            <PolicyLink label="Read our Privacy Policy" path="/privacy.html" accentColor={accentColor} mutedTextColor={mutedTextColor} />
            <PolicyLink label="View our Terms of Service" path="/terms.html" accentColor={accentColor} mutedTextColor={mutedTextColor} />
          </div>
        </div>
      </SectionWithAnimation>

      {/* Call to Action Section - Reused from Home.jsx */}
      <section style={{ padding: "60px 20px", textAlign: "center", background: sectionBgColor, borderTop: `1px solid ${sectionBorderColor}`, borderBottom: `1px solid ${sectionBorderColor}`, margin: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "30px" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: accentColor }}>Ready to Transform Your Connections?</h2>
        <p style={{ fontSize: "1.2rem", maxWidth: "800px", color: mutedTextColor }}>
          Join Pluse CRM today and start building stronger, more meaningful relationships with ease.
        </p>
        <button
          onClick={handleSignInSignUp}
          style={{
            padding: "18px 35px",
            fontSize: "1.3rem",
            fontWeight: "bold",
            background: accentColor,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "background 0.3s ease, transform 0.2s ease",
            boxShadow: "0 6px 20px rgba(76, 175, 80, 0.5)",
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = "#43A047"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = accentColor; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          Get Started Now
        </button>
      </section>

      {/* Footer Section - Reused from Home.jsx */}
      <footer
        style={{
          background: headerBgColor,
          borderTop: `1px solid ${headerBorderColor}`,
          padding: "40px 20px",
          textAlign: "center",
          color: mutedTextColor,
          fontSize: "0.9rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <img src="/logo.png" alt="Pluse CRM Logo" style={{ width: "30px", height: "30px", borderRadius: "50%" }} />
              <span style={{ fontWeight: "700", fontSize: "20px", color: textColor }}>Pluse</span>
            </div>
            <p style={{ maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
              Pluse CRM helps you nurture your relationships, remember important details, and stay connected with the people who matter most.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px 30px", marginBottom: "30px" }}>
            <PolicyLink label="Privacy Policy" path="/privacy.html" accentColor={accentColor} mutedTextColor={mutedTextColor} />
            <PolicyLink label="Terms of Service" path="/terms.html" accentColor={accentColor} mutedTextColor={mutedTextColor} />
          </div>

          <p>&copy; {new Date().getFullYear()} Pluse CRM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
