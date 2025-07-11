// google-oauth-app/frontend/src/pages/Home.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useInView } from 'react-intersection-observer';

// Reusable NavLink Component for Header
const NavLink = ({ label, navigate, path }) => {
  const textColor = "var(--foreground)";
  const accentColor = "#4CAF50"; // Soft green accent

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
        "&:hover": {
          color: accentColor,
        },
      }}
    >
      {label}
    </a>
  );
};

// Reusable FooterLink Component
const FooterLink = ({ label, path }) => {
  const textColor = "var(--muted-foreground)";
  const accentColor = "#4CAF50"; // Soft green accent

  return (
    <a
      href={path}
      style={{
        textDecoration: "none",
        color: textColor,
        fontSize: "0.9rem",
        transition: "color 0.2s ease",
        "&:hover": {
          color: accentColor,
        },
      }}
    >
      {label}
    </a>
  );
};

// Reusable Section with Scroll Animation Component
const SectionWithAnimation = ({ id, theme, accentColor, sectionBgColor, sectionBorderColor, title, children }) => {
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
        background: sectionBgColor, // Can be a gradient
        borderRadius: "20px", // More rounded
        border: `1px solid ${sectionBorderColor}`,
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)", // Softer shadow
        ...animationStyle,
      }}
    >
      <h2 style={{ fontSize: "2.8rem", fontWeight: "bold", marginBottom: "50px", textAlign: "center", color: accentColor }}>{title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px" }}>
        {children}
      </div>
    </section>
  );
};

// Reusable Feature Card Component
const FeatureCard = ({ icon, title, description, theme }) => {
  const cardBgColor = theme === 'dark' ? "var(--background)" : "#F8FBF8"; // Match overall lighter background
  const textColor = theme === 'dark' ? "var(--foreground)" : "#303030";
  const mutedTextColor = theme === 'dark' ? "var(--muted-foreground)" : "#606060";
  const cardBorderColor = theme === 'dark' ? "var(--border)" : "#E0E5E0";
  const accentColor = "#4CAF50";

  return (
    <div style={{
      padding: "30px",
      background: cardBgColor,
      borderRadius: "15px", // More rounded cards
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)", // Softer shadow
      border: `1px solid ${cardBorderColor}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)", // Slightly more pronounced on hover
      },
    }}>
      <div style={{ fontSize: "3rem", marginBottom: "15px", color: accentColor }}>{icon}</div>
      <h3 style={{ fontSize: "1.6rem", fontWeight: "bold", marginBottom: "10px", color: textColor }}>{title}</h3>
      <p style={{ fontSize: "1rem", lineHeight: "1.6", color: mutedTextColor }}>{description}</p>
    </div>
  );
};

// Reusable Benefit Card Component (now also accepts an icon prop)
const BenefitCard = ({ icon, title, description, theme }) => {
  const cardBgColor = theme === 'dark' ? "var(--card)" : "#F8FBF8"; // Match overall lighter background
  const textColor = theme === 'dark' ? "var(--foreground)" : "#303030";
  const mutedTextColor = theme === 'dark' ? "var(--muted-foreground)" : "#606060";
  const cardBorderColor = theme === 'dark' ? "var(--border)" : "#E0E5E0";
  const accentColor = "#4CAF50";

  return (
    <div style={{
      padding: "30px",
      background: cardBgColor,
      borderRadius: "15px", // More rounded cards
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)", // Softer shadow
      border: `1px solid ${cardBorderColor}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
      },
    }}>
      <div style={{ fontSize: "3rem", marginBottom: "15px", color: accentColor }}>{icon}</div>
      <h3 style={{ fontSize: "1.6rem", fontWeight: "bold", marginBottom: "10px", color: accentColor }}>{title}</h3>
      <p style={{ fontSize: "1rem", lineHeight: "1.6", color: mutedTextColor }}>{description}</p>
    </div>
  );
};

// New FAQ Card Component
const FAQCard = ({ question, answer, theme }) => {
  const cardBgColor = theme === 'dark' ? "var(--background)" : "#F8FBF8"; // Match overall lighter background
  const textColor = theme === 'dark' ? "var(--foreground)" : "#303030";
  const mutedTextColor = theme === 'dark' ? "var(--muted-foreground)" : "#606060";
  const cardBorderColor = theme === 'dark' ? "var(--border)" : "#E0E5E0";
  const accentColor = "#4CAF50";

  return (
    <div style={{
      padding: "25px",
      background: cardBgColor,
      borderRadius: "15px", // More rounded cards
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)", // Softer shadow
      border: `1px solid ${cardBorderColor}`,
      transition: "transform 0.2s ease-in-out",
      "&:hover": {
        transform: "translateY(-3px)",
      },
    }}>
      <h3 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "10px", color: accentColor }}>{question}</h3>
      <p style={{ fontSize: "1rem", lineHeight: "1.6", color: mutedTextColor }}>{answer}</p>
    </div>
  );
};


export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, theme, toggleTheme } = useAuth();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  // State for typing animation
  const headlineText = "Stay closer to the people who matter.";
  const [displayedHeadline, setDisplayedHeadline] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < headlineText.length) {
        setDisplayedHeadline((prev) => prev + headlineText.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        // Start cursor blinking after typing is complete
        setInterval(() => {
          setShowCursor((prev) => !prev);
        }, 500); // Blinks every 500ms
      }
    }, 70); // Typing speed (milliseconds per character)

    return () => {
      clearInterval(typingInterval);
    };
  }, []); // Run once on component mount

  // Define colors for "Soft & Gradient" style
  const bgColor = theme === 'dark' ? "#1A222A" : "#F8FBF8"; // Soft dark blue-grey / very light green-tinted white
  const textColor = theme === 'dark' ? "#E0E6EB" : "#303030"; // Soft light grey / soft dark grey
  const accentColor = "#4CAF50"; // Classic, slightly muted green
  const sectionBgColor = theme === 'dark' ? "linear-gradient(145deg, #2A343D, #1F2830)" : "linear-gradient(145deg, #FFFFFF, #F0F5F0)"; // Subtle gradients
  const sectionBorderColor = theme === 'dark' ? "#3A454F" : "#E0E5E0";
  const mutedTextColor = theme === 'dark' ? "#A0A8B0" : "#606060";
  const headerBgColor = theme === 'dark' ? "#1A222A" : "#FFFFFF";
  const headerBorderColor = theme === 'dark' ? "#3A454F" : "#E8EBE8";


  const handleSignInSignUp = () => {
    if (isAuthenticated) navigate("/dashboard");
    else navigate("/login");
  };

  const handleChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSending(true);
  setFormMessage(null);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // in case you're using cookies/session
      body: JSON.stringify(contactForm),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    setSent(true);
    setFormMessage("Message sent successfully!");
    setContactForm({ name: '', email: '', message: '' });
  } catch (err) {
    console.error("Failed to send message:", err);
    setFormMessage("Failed to send message. Please try again.");
  } finally {
    setSending(false);
  }
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
      {/* Top Navigation Bar */}
      <header
        style={{
          width: "100%",
          height: "70px", // Slightly taller header
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px", // More padding
          borderBottom: `1px solid ${headerBorderColor}`,
          background: headerBgColor,
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)", // Softer shadow
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/logo.png"
            alt="Pulse CRM Logo"
            style={{ width: "36px", height: "36px", borderRadius: "50%" }} // Slightly larger logo
          />
          <span style={{ fontWeight: "700", fontSize: "24px", color: textColor, letterSpacing: "-0.8px" }}>
            Pulse
          </span>
        </div>
        <nav style={{ display: "flex", gap: "25px", alignItems: "center" }}>
          <NavLink label="Features" navigate={navigate} path="/#features-section" />
          <NavLink label="Benefits" navigate={navigate} path="/#benefits-section" />
          <NavLink label="FAQ" navigate={navigate} path="/#faq-section" />
          <NavLink label="Contact" navigate={navigate} path="/#contact-section" />
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem", // Larger icon
              color: accentColor,
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            }}
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
              borderRadius: "8px", // More rounded button
              cursor: "pointer",
              transition: "background 0.3s ease, transform 0.2s ease",
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)", // Accent color shadow
              "&:hover": {
                background: "#43A047", // Slightly darker green on hover
                transform: "translateY(-1px)",
              },
            }}
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Hero Section - Two-Column Layout for Desktop, Stacked for Mobile */}
      <section
        style={{
          width: "100%",
          minHeight: "85vh", // Slightly taller hero section
          display: "flex",
          flexDirection: "column", // Default to column for mobile
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px", // Adjusted padding
          background: bgColor,
          gap: "40px", // Space between major blocks
          textAlign: "center", // Default text alignment
          // Media query for desktop layout
          "@media (min-width: 992px)": {
            flexDirection: "row", // Row direction for desktop
            justifyContent: "space-evenly", // Distribute space
            padding: "80px 40px", // More padding on desktop
            textAlign: "left", // Align text to left on desktop
          },
        }}
      >
        {/* Left Column: Headline & Main Description Block */}
        <div
          style={{
            maxWidth: "600px", // Max width for readability
            // Adjust margin for desktop alignment
            "@media (min-width: 992px)": {
              marginRight: "40px", // Space between text and image
            },
          }}
        >
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              marginBottom: "20px",
              lineHeight: "1.2",
              color: textColor,
              textShadow: theme === 'dark' ? "none" : "1px 1px 3px rgba(0,0,0,0.2)",
              // Responsive font size for larger screens
              "@media (min-width: 768px)": {
                fontSize: "4.5rem",
              },
              "@media (min-width: 992px)": {
                fontSize: "4.8rem", // Even larger on desktop
              },
            }}
          >
            {displayedHeadline}
            <span
              style={{
                opacity: showCursor ? 1 : 0,
                transition: 'opacity 0.2s ease-in-out',
                color: accentColor, // Cursor color
              }}
            >
              {displayedHeadline.length < headlineText.length ? "|" : ""}
            </span>
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              lineHeight: "1.7",
              color: mutedTextColor,
              maxWidth: "700px", // Constrain width for readability
              margin: "0 auto 30px auto", // Adjusted margin for spacing below paragraph
              // Adjust margin for desktop alignment
              "@media (min-width: 992px)": {
                margin: "0 0 30px 0", // No auto margin on left/right for desktop
              },
            }}
          >
            Organize your network, remember special moments, and never forget to follow up. Pulse CRM syncs with your Google Contacts to help you manage relationships effortlessly.
          </p>

          {/* CTA Button and small text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center", // Center for mobile
              gap: "15px",
              // Align to left for desktop
              "@media (min-width: 992px)": {
                alignItems: "flex-start",
              },
            }}
          >
            <button
              onClick={handleSignInSignUp}
              style={{
                padding: "16px 30px",
                fontSize: "1.1rem",
                fontWeight: "bold",
                background: accentColor,
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "background 0.3s ease, transform 0.2s ease",
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                "&:hover": {
                  background: "#43A047",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Start Free Trial
            </button>
            <p style={{
              fontSize: "0.9rem",
              color: mutedTextColor,
              marginTop: "10px",
            }}>
              No credit card required
            </p>
            <p style={{ marginTop: "20px" }}>
              <a
                href="/forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
                style={{
                  color: accentColor,
                  textDecoration: "none",
                  fontWeight: "500",
                  transition: "color 0.2s ease",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Forgot your password?
              </a>
            </p>
          </div>
        </div>

        {/* Right Column: Image Section */}
        <div
          style={{
            width: "100%",
            maxWidth: "700px", // Max width for the image on mobile/tablet
            margin: "0 auto", // Center for mobile/tablet
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // Adjust width for desktop layout
            "@media (min-width: 992px)": {
              maxWidth: "55%", // Take up more space on desktop
              margin: "0", // Remove auto margin for desktop
            },
          }}
        >
          <img
            src="/illustrations/dashboard-green.png"
            alt="Pulse CRM dashboard preview"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "15px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
              filter: theme === 'dark' ? "brightness(0.7) grayscale(0.1)" : "brightness(1)",
              transition: "filter 0.5s ease-in-out",
            }}
          />
        </div>
      </section>

      {/* Privacy/CTA Block (moved closer to Hero and adjusted for two-column layout) */}
      {/* This block was previously inside the Hero section but is now a separate section
          to allow for the two-column hero layout. Its content is still relevant to the hero. */}
      <section
        style={{
          maxWidth: "900px", // Max width for readability
          margin: "60px auto", // Centered below hero
          padding: "0 20px", // Padding for content
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Center content
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "1.1rem",
            lineHeight: "1.6",
            color: mutedTextColor,
            marginBottom: "15px",
          }}
        >
          We use this access solely to display your contact details — including saved contacts and people you've interacted with on Gmail (even if not manually saved). Nothing is stored unless you choose to create notes, reminders, or interactions manually.
        </p>
      </section>

      {/* Features Section */}
      <SectionWithAnimation id="features-section" theme={theme} accentColor={accentColor} sectionBgColor={sectionBgColor} sectionBorderColor={sectionBorderColor} title="Core Capabilities">
        <FeatureCard
          icon="👥"
          title="Contact Management"
          description="Centralized database for detailed profiles including names, emails, phones, and social media."
          theme={theme}
        />
        <FeatureCard
          icon="💬"
          title="Interaction Tracking"
          description="Maintain a chronological log of conversations, meetings, and relationship timelines."
          theme={theme}
        />
        <FeatureCard
          icon="⏰"
          title="Reminder Setting"
          description="Automated follow-ups and alerts for birthdays, anniversaries, and important dates."
          theme={theme}
        />
        <FeatureCard
          icon="📝"
          title="Note-taking"
          description="Add rich text notes and personal insights to personalize interactions."
          theme={theme}
        />
        <FeatureCard
          icon="⚙️"
          title="Customizable Views"
          description="Filter and sort contacts, and manage custom groups for focused outreach."
          theme={theme}
        />
        <FeatureCard
          icon="🔗"
          title="Seamless Integrations"
          description="Connect with email, calendar, social media, and Google Contacts for streamlined workflows."
          theme={theme}
        />
        <FeatureCard
          icon="📱"
          title="Anywhere Access"
          description="Manage relationships on the go with cross-device compatibility and responsive design."
          theme={theme}
        />
      </SectionWithAnimation>

      {/* Benefits Section */}
      <SectionWithAnimation id="benefits-section" theme={theme} accentColor={accentColor} sectionBgColor={sectionBgColor} sectionBorderColor={sectionBorderColor} title="Why Pulse CRM?">
        <BenefitCard
          icon="✨"
          title="Never Miss an Opportunity"
          description="Stay on top of follow-ups and important dates, ensuring no valuable connection or opportunity slips through the cracks."
          theme={theme}
        />
        <BenefitCard
          icon="🤝"
          title="Stronger Relationships"
          description="Personalize every conversation with detailed interaction logs and comprehensive notes, fostering trust and deeper bonds."
          theme={theme}
        />
        <BenefitCard
          icon="⚡"
          title="Increased Efficiency"
          description="Streamline your workflow with centralized information and integrations, freeing up time for meaningful engagement."
          theme={theme}
        />
        <BenefitCard
          icon="🧠"
          title="Better Decisions"
          description="Gain valuable context from interaction history and notes to make more informed decisions about nurturing relationships."
          theme={theme}
        />
        <BenefitCard
          icon="🗂️"
          title="Enhanced Organization"
          description="Organize your entire network in a structured and customizable way, easily finding contacts when you need them."
          theme={theme}
        />
        <BenefitCard
          icon="🚀"
          title="Flexibility & Convenience"
          description="Manage relationships on the go with seamless accessibility across all your devices, always at your fingertips."
          theme={theme}
        />
        <BenefitCard
          icon="🎯"
          title="Personalized Outreach"
          description="Tailor your communication using detailed insights, making your contacts feel valued and understood."
          theme={theme}
        />
      </SectionWithAnimation>

      {/* New FAQ Section for Google OAuth Reviewers */}
      <SectionWithAnimation id="faq-section" theme={theme} accentColor={accentColor} sectionBgColor={sectionBgColor} sectionBorderColor={sectionBorderColor} title="Frequently Asked Questions (FAQ)">
        <FAQCard
          question="1. What Google user data does Pulse CRM access and why?"
          answer="Pulse CRM accesses your Google Contacts (specifically, the 'contacts.readonly' and 'contacts.other.readonly' scopes) to display your contacts within the application interface. This includes both contacts you've explicitly saved and people you've interacted with on Gmail (even if not manually saved as a contact). This access is solely to enable you to view, organize, and interact with your entire network directly within Pulse CRM. We only request the minimum necessary access to provide core CRM functionalities."
          theme={theme}
        />
        <FAQCard
          question="2. Does Pulse CRM store my Google Contacts data?"
          answer="No. Pulse CRM **does not store or retain any of your Google Contacts data on our servers.** All processing of your Google Contacts occurs in real-time directly within your browser session. This means your contact details (names, emails, phone numbers, etc.) are fetched from Google and displayed, but are not saved by Pulse CRM. When you close the application or log out, your Google Contacts data is no longer accessible by Pulse CRM."
          theme={theme}
        />
        <FAQCard
          question="3. How does Pulse CRM use my Google Contacts data if it doesn't store it?"
          answer="Your Google Contacts data is fetched directly from Google's API and displayed temporarily in your browser for your current session. This allows you to view your contacts, search them, and link your custom notes, reminders, and interaction logs (which *are* stored on our secure servers) to those contacts using their unique Google Contact ID. This ensures your personal contact details remain exclusively with Google, while your CRM-specific insights are managed by Pulse CRM. Nothing from your Google Contacts is stored unless you explicitly create a new note, reminder, or interaction record within Pulse CRM."
          theme={theme}
        />
        <FAQCard
          question="4. How does Pulse CRM ensure my privacy and data security?"
          answer="We prioritize your privacy and data security. For Google Contacts, we implement a strict 'no storage' policy for the contact details themselves. For any data you do create and store within Pulse CRM (like notes or reminders), we use secure server infrastructure, industry-standard encryption, and strict access controls. We adhere to our Privacy Policy, which transparently outlines our data handling practices and our commitment to protecting your information."
          theme={theme}
        />
        <FAQCard
          question="5. How can I revoke Pulse CRM's access to my Google account?"
          answer="You can revoke Pulse CRM's access to your Google account at any time. Simply go to your Google Account settings, navigate to 'Security,' then 'Third-party apps with account access,' and remove Pulse CRM from the list. This will immediately stop Pulse CRM from accessing your Google Contacts, and any notes or reminders you created in Pulse CRM that were linked to those contacts will remain, but without the original contact's details."
          theme={theme}
        />
      </SectionWithAnimation>

      {/* Call to Action Section */}
      <section style={{ padding: "60px 20px", textAlign: "center", background: sectionBgColor, borderTop: `1px solid ${sectionBorderColor}`, borderBottom: `1px solid ${sectionBorderColor}`, margin: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "30px" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: accentColor }}>Ready to Transform Your Connections?</h2>
        <p style={{ fontSize: "1.2rem", maxWidth: "800px", color: mutedTextColor }}>
          Join Pulse CRM today and start building stronger, more meaningful relationships with ease.
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
            "&:hover": {
              background: "#43A047",
              transform: "translateY(-2px)",
            },
          }}
        >
          Get Started Now
        </button>
      </section>

      {/* Contact Section */}
      <section id="contact-section" style={{ padding: "80px 20px", maxWidth: "800px", margin: "60px auto", background: sectionBgColor, borderRadius: "12px", border: `1px solid ${sectionBorderColor}`, textAlign: "center" }}>
        <h2 style={{ fontSize: "2.8rem", fontWeight: "bold", marginBottom: "30px", color: accentColor }}>Get in Touch</h2>
        <p style={{ fontSize: "1.2rem", lineHeight: "1.6", marginBottom: "40px", color: mutedTextColor }}>
          Have questions, feedback, or just want to say hello? We'd love to hear from you!
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px", margin: "0 auto" }}>
          <input
            name="name"
            type="text"
            value={contactForm.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            style={{
              padding: "15px",
              fontSize: "1rem",
              borderRadius: "8px",
              border: `1px solid ${sectionBorderColor}`,
              background: bgColor,
              color: textColor,
              "&:focus": {
                outline: `2px solid ${accentColor}`,
                borderColor: "transparent",
              },
            }}
          />
          <input
            name="email"
            type="email"
            value={contactForm.email}
            onChange={handleChange}
            placeholder="Your Email"
            required
            style={{
              padding: "15px",
              fontSize: "1rem",
              borderRadius: "8px",
              border: `1px solid ${sectionBorderColor}`,
              background: bgColor,
              color: textColor,
              "&:focus": {
                outline: `2px solid ${accentColor}`,
                borderColor: "transparent",
              },
            }}
          />
          <textarea
            name="message"
            rows="6"
            value={contactForm.message}
            onChange={handleChange}
            placeholder="Your Message"
            required
            style={{
              padding: "15px",
              fontSize: "1rem",
              borderRadius: "8px",
              border: `1px solid ${sectionBorderColor}`,
              background: bgColor,
              color: textColor,
              resize: "vertical",
              "&:focus": {
                outline: `2px solid ${accentColor}`,
                borderColor: "transparent",
              },
            }}
          ></textarea>
          {formMessage && (
            <div style={{
              padding: "10px",
              borderRadius: "8px",
              background: sent ? "#D4EDDA" : "#F8D7DA",
              color: sent ? "#155724" : "#721C24",
              border: `1px solid ${sent ? "#C3E6CB" : "#F5C6CB"}`,
              marginBottom: "15px",
              fontSize: "0.9rem",
            }}>
              {formMessage}
            </div>
          )}
          <button
            type="submit"
            disabled={sending}
            style={{
              padding: "15px 30px",
              fontSize: "1.2rem",
              fontWeight: "bold",
              background: accentColor,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.3s ease, transform 0.2s ease",
              boxShadow: "0 4px 15px rgba(76, 175, 80, 0.4)",
              "&:hover": {
                background: "#43A047",
                transform: "translateY(-2px)",
              },
            }}
          >
            {sending ? "Sending..." : sent ? "Message Sent!" : "Send Message"}
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "40px 20px",
          textAlign: "center",
          borderTop: `1px solid ${sectionBorderColor}`,
          marginTop: "0",
          color: mutedTextColor,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          "@media (min-width: 768px)": {
            flexDirection: "row",
            justifyContent: "space-between",
            padding: "40px 40px",
          },
        }}
      >
        <p>&copy; {new Date().getFullYear()} Pulse CRM. All rights reserved.</p>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          <FooterLink label="Privacy Policy" path="/privacy.html" />
          <FooterLink label="Terms of Service" path="/terms.html" />
          <FooterLink label="Affiliate" path="/affiliate.html" />
        </div>
      </footer>
    </div>
  );
}
