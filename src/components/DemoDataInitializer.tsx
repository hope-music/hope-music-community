"use client";

import { useEffect } from "react";

const demoData = {
  admin_news: [
    {
      id: "demo-1",
      title: "Announcing the 2024 Global Musicals Gala line-up",
      coverImage: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200",
      content: `<p class="font-semibold text-lg text-gray-800">We are thrilled to officially announce the lineup for the 2024 Global Musicals Gala, featuring world-renowned performers and groundbreaking theatrical productions from across the globe.</p>
      <p>This year's gala promises to be the most ambitious yet, bringing together award-winning composers, directors, and performers from Broadway, West End, and international stages. Audiences can expect exclusive previews of upcoming productions, live performances of classic musical numbers, and behind-the-scenes insights into the creative process.</p>
      <p>"This Gala represents the pinnacle of musical theater excellence," noted the artistic director. "We've curated a program that celebrates both timeless classics and innovative new works that push the boundaries of what musical theater can achieve."</p>
      <p>Stay tuned for detailed schedule announcements, ticket availability, and special VIP experiences.</p>`,
      excerpt: "Join us for the most spectacular musical event of the year.",
      isPublished: true,
      isFeatured: true,
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000 * 2,
    },
    {
      id: "demo-2",
      title: "Hope Studio partners with industry leader for pro-audio workshop series",
      coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200",
      content: `<p class="font-semibold text-lg text-gray-800">We are excited to announce our new partnership with leading audio industry professionals for an exclusive workshop series.</p>
      <p>Learn from the best in the industry with our comprehensive workshop program covering recording techniques, mixing fundamentals, mastering essentials, and live sound reinforcement.</p>
      <p>These workshops are designed for aspiring audio engineers, music producers, and anyone looking to elevate their sound production skills to professional standards.</p>`,
      excerpt: "Learn from the best in the industry with our new workshop partnership.",
      isPublished: true,
      isFeatured: false,
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5,
    },
  ],

  admin_performance: [
    {
      id: "demo-p1",
      title: "Les Misérables - The Timeless Musical",
      category: "musical",
      coverImage: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800",
      description: "Experience the epic tale of revolution, redemption, and the human spirit in this spectacular production.",
      content: `<h2>A Spectacular Production</h2>
      <p>Les Misérables stands as one of the most beloved musicals of all time, telling the story of Jean Valjean and his journey through post-revolutionary France.</p>
      <p>This production features a cast of over 50 performers, a full orchestra, and stunning visual design that brings 19th century Paris to life.</p>
      <h3>Performance Details</h3>
      <ul>
        <li>Duration: 3 hours with intermission</li>
        <li>Live orchestral accompaniment</li>
        <li>Suitable for all ages</li>
      </ul>
      <p>Don't miss this unforgettable theatrical experience!</p>`,
      status: "past",
      eventDate: "2024-06-15",
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 30,
    },
    {
      id: "demo-p2",
      title: "The Phantom of the Opera - Summer Production",
      category: "opera",
      coverImage: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800",
      description: "The haunting love story returns with new staging and spectacular effects.",
      content: `<h2>Rediscover the Mystery</h2>
      <p>The Phantom of the Opera tells the story of a masked figure who lurks beneath the catacombs of the Paris Opera House, exercising a reign of terror over its actors and managers.</p>
      <p>This summer's production features updated lighting design and new costume elements while preserving the magic that has captivated audiences for decades.</p>`,
      status: "past",
      eventDate: "2024-08-20",
      createdAt: Date.now() - 86400000 * 60,
      updatedAt: Date.now() - 86400000 * 60,
    },
    {
      id: "demo-p3",
      title: "Annual Winter Concert 2024",
      category: "concert",
      coverImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
      description: "Join us for an evening of holiday favorites and classical masterpieces.",
      content: `<h2>Celebrate the Season</h2>
      <p>Our annual winter concert brings together the full HOPE ensemble for an evening of festive music ranging from traditional carols to contemporary holiday hits.</p>
      <p>Tickets are limited - reserve yours today!</p>`,
      status: "upcoming",
      eventDate: "2024-12-20",
      createdAt: Date.now() - 86400000 * 10,
      updatedAt: Date.now() - 86400000 * 10,
    },
    {
      id: "demo-p4",
      title: "Summer EDM Festival 2024",
      category: "edm",
      coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
      description: "Three days of electronic music featuring top DJs from around the world.",
      content: `<h2>The Biggest EDM Event of the Year</h2>
      <p>Join us for an unforgettable weekend of electronic dance music featuring world-class DJs, spectacular light shows, and an incredible atmosphere.</p>`,
      status: "past",
      eventDate: "2024-07-15",
      createdAt: Date.now() - 86400000 * 50,
      updatedAt: Date.now() - 86400000 * 50,
    },
    {
      id: "demo-p5",
      title: "Rock Legends Live",
      category: "rock-roll",
      coverImage: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800",
      description: "Classic rock hits performed by legendary musicians.",
      content: `<h2>A Night of Rock Classics</h2>
      <p>Experience the power of classic rock with this incredible lineup of legendary musicians performing all your favorite hits.</p>`,
      status: "past",
      eventDate: "2024-05-30",
      createdAt: Date.now() - 86400000 * 70,
      updatedAt: Date.now() - 86400000 * 70,
    },
  ],

  admin_stage_production: [
    {
      id: "demo-s1",
      title: "Professional Lighting Rig for 'The Great Gatsby'",
      category: "lighting",
      coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800",
      description: "A comprehensive lighting design featuring over 200 fixtures for our award-winning production.",
      content: `<h2>Lighting Design Excellence</h2>
      <p>Our lighting team designed an immersive 1920s atmosphere using period-accurate fixtures combined with modern LED technology.</p>
      <p>The design won recognition at the Regional Theater Awards for Best Lighting Design.</p>
      <h3>Equipment Used</h3>
      <ul>
        <li>200+ Moving Head Fixtures</li>
        <li>LED Pars and Fresnels</li>
        <li>Custom Gobo Patterns</li>
        <li>Full DMX Control System</li>
      </ul>`,
      status: "past",
      eventDate: "2024-05-10",
      createdAt: Date.now() - 86400000 * 45,
      updatedAt: Date.now() - 86400000 * 45,
    },
    {
      id: "demo-s2",
      title: "Scenic Design: 'A Midsummer Night's Dream'",
      category: "sets",
      coverImage: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800",
      description: "Transforming the stage into an enchanted forest with movable set pieces and projections.",
      content: `<h2>Bringing the Forest to Life</h2>
      <p>Our scenic design team created an immersive forest environment using a combination of physical set pieces and projection mapping.</p>
      <p>The design allowed for quick scene changes while maintaining the magical atmosphere of Shakespeare's comedy.</p>`,
      status: "past",
      eventDate: "2024-07-22",
      createdAt: Date.now() - 86400000 * 90,
      updatedAt: Date.now() - 86400000 * 90,
    },
  ],

  admin_hope_studio: [
    {
      id: "demo-h1",
      serviceName: "Professional Recording Sessions",
      category: "recording",
      coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
      description: "State-of-the-art recording with our SSL console and experienced engineers.",
      content: `<h2>World-Class Recording</h2>
      <p>Our studio features a 32-channel SSL console, a collection of vintage and modern microphones, and acoustically treated rooms.</p>
      <p>Whether you're recording a solo artist or a full band, we have the equipment and expertise to capture your sound.</p>
      <h3>What's Included</h3>
      <ul>
        <li>Professional Engineer</li>
        <li>Industry-Standard DAW</li>
        <li>Instrument Rental Available</li>
        <li>Mixing & Mastering Options</li>
      </ul>`,
      availability: "Mon-Sat, 10am - 10pm",
      pricing: "From $150/hour",
      createdAt: Date.now() - 86400000 * 20,
      updatedAt: Date.now() - 86400000 * 20,
    },
    {
      id: "demo-h2",
      serviceName: "Audio Mixing & Mastering",
      category: "mixing",
      coverImage: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800",
      description: "Professional mixing and mastering to make your tracks radio-ready.",
      content: `<h2>Polish Your Sound</h2>
      <p>Our mixing engineers have credits on hundreds of releases across multiple genres. We'll polish your tracks and bring them to life with clarity, punch, and presence.</p>
      <p>Mastering ensures your final mixes translate perfectly across all playback systems.</p>`,
      availability: "By appointment",
      pricing: "Mixing from $200, Mastering from $100/track",
      createdAt: Date.now() - 86400000 * 25,
      updatedAt: Date.now() - 86400000 * 25,
    },
    {
      id: "demo-h3",
      serviceName: "Music Production Lessons",
      category: "lessons",
      coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800",
      description: "Learn music production, theory, and instrument skills with our experienced faculty.",
      content: `<h2>Learn from the Pros</h2>
      <p>We offer lessons in piano, guitar, voice, music theory, and music production for all skill levels.</p>
      <p>Lessons are tailored to your goals, whether you're a beginner or looking to refine your professional skills.</p>`,
      availability: "Flexible scheduling",
      pricing: "From $60/lesson",
      createdAt: Date.now() - 86400000 * 15,
      updatedAt: Date.now() - 86400000 * 15,
    },
  ],

  admin_interaction: [
    {
      id: "demo-i1",
      title: "Getting Started with Pro Tools",
      category: "software",
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      author: "HOPE Studio Team",
      description: "A comprehensive guide for beginners looking to start their music production journey with Pro Tools.",
      content: `<h2>Introduction to Pro Tools</h2>
      <p>Pro Tools remains the industry standard for professional audio production. In this guide, we'll walk you through the basics of getting started.</p>
      <h3>Topics Covered</h3>
      <ul>
        <li>Setting up your first session</li>
        <li>Recording audio</li>
        <li>Basic editing techniques</li>
        <li>Mixing fundamentals</li>
      </ul>
      <p>Stay tuned for more advanced tutorials coming soon!</p>`,
      createdAt: Date.now() - 86400000 * 8,
      updatedAt: Date.now() - 86400000 * 8,
    },
    {
      id: "demo-i2",
      title: "Choosing the Right Microphone",
      category: "hardware",
      coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800",
      author: "Audio Engineer Team",
      description: "An essential guide to understanding different microphone types and their best use cases.",
      content: `<h2>Microphone Types Explained</h2>
      <p>Choosing the right microphone can make or break your recording. Here's what you need to know about the main types:</p>
      <h3>Dynamic Microphones</h3>
      <p>Great for live performance and loud sound sources. Durable and affordable.</p>
      <h3>Condenser Microphones</h3>
      <p>Ideal for studio recording. They capture more detail and are perfect for vocals and acoustic instruments.</p>
      <h3>Ribbon Microphones</h3>
      <p>Vintage-inspired design with a smooth, natural sound. Popular for recording guitar amps and brass.</p>`,
      createdAt: Date.now() - 86400000 * 12,
      updatedAt: Date.now() - 86400000 * 12,
    },
    {
      id: "demo-i3",
      title: "Essential DAW Comparison 2024",
      category: "software",
      coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800",
      author: "HOPE Research Team",
      description: "Comparing the top digital audio workstations for different needs and budgets.",
      content: `<h2>Choosing Your DAW</h2>
      <p>The Digital Audio Workstation (DAW) is the heart of your music production setup. Here's our comparison of the top options:</p>
      <h3>Professional Tier</h3>
      <p><strong>Pro Tools</strong> - Industry standard, used in most major studios</p>
      <p><strong>Logic Pro</strong> - Apple's professional option, excellent for composers</p>
      <p><strong>Ableton Live</strong> - Favorite among electronic music producers</p>
      <h3>Home Studio Tier</h3>
      <p><strong>Reaper</strong> - Affordable, customizable, great value</p>
      <p><strong>Studio One</strong> - User-friendly, excellent features</p>`,
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 86400000 * 5,
    },
  ],
};

export default function DemoDataInitializer() {
  useEffect(() => {
    Object.entries(demoData).forEach(([key, value]) => {
      const existing = localStorage.getItem(key);
      if (!existing || JSON.parse(existing).length === 0) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });
  }, []);

  return null;
}
