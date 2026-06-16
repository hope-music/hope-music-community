"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export interface CooperationData {
  heroTitle: string;
  introText1: string;
  introText2: string;
  link1Title: string;
  link2Title: string;
  image1: string;
  image2: string;
  image3: string;
}

export const DEFAULT_COOPERATION_DATA: CooperationData = {
  heroTitle: "Join Our Creative Team",
  introText1: "Production is officially underway for the musical Shangri-La! We warmly welcome talented singers, instrumentalists, and dancers from all over the world to join our creative team.\n\nTo apply, please navigate to the \"COOPERATION\" section on our homepage and select \"WELCOME TO OUR MUSICAL PERFORMANCE TEAM.\"",
  introText2: "Whether you represent an agency, performance group, theater, or other organization—or are an individual artist—we would love to explore a partnership with you.\n\nTo connect with us, please visit the \"COOPERATION\" section on our homepage and select \"WE LOOK FORWARD TO COOPERATING WITH YOU ON ALL TYPES OF MUSIC BUSINESS PROJECTS.\"",
  link1Title: "WELCOME TO OUR MUSICAL PERFORMANCE TEAM",
  link2Title: "WE LOOK FORWARD TO COOPERATING WITH YOU ON ALL TYPES OF MUSIC BUSINESS PROJECTS",
  image1: "/images/Cooperation/Cooperation 1.jpg",
  image2: "/images/Cooperation/Cooperation 2.jpg",
  image3: "/images/Cooperation/Cooperation 3.jpg",
};

const COOPERATION_STORAGE_KEY = "cooperation_content";

function CooperationContent({ data }: { data: CooperationData }) {
  const handleOpenModal = (type: "performance" | "business") => {
    if (type === "performance") {
      window.dispatchEvent(new CustomEvent("openCooperationModal"));
    } else {
      window.dispatchEvent(new CustomEvent("openBusinessCooperationModal"));
    }
  };

  return (
    <div className="space-y-12">
      {/* Section 1: Image 1 + Title + Text 1 */}
      <div>
        <div style={{
          borderRadius: "0.75rem",
          overflow: "hidden",
          height: "350px",
          background: "#f5f5f5",
          marginBottom: "1.5rem"
        }}>
          <Image
            src={data.image1}
            alt="Cooperation 1"
            width={1200}
            height={700}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 style={{
          fontSize: "1.75rem",
          fontWeight: "700",
          color: "#e85d04",
          marginBottom: "1.5rem"
        }}>
          {data.heroTitle}
        </h2>

        <div style={{
          background: "linear-gradient(135deg, #fef3e2 0%, #fff8f0 100%)",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          borderLeft: "4px solid #e85d04"
        }}>
          {data.introText1.split("\n\n").map((paragraph, index) => (
            <p key={index} style={{
              lineHeight: "1.8",
              fontSize: "1.1rem",
              color: "#333",
              marginBottom: index < data.introText1.split("\n\n").length - 1 ? "1rem" : 0
            }}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Section 2: Image 2 + Yellow Box + Text 2 */}
      <div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "2rem"
        }}>
          <div style={{
            borderRadius: "0.75rem",
            overflow: "hidden",
            height: "300px",
            background: "#f5f5f5"
          }}>
            <Image
              src={data.image2}
              alt="Cooperation 2"
              width={800}
              height={500}
              className="w-full h-full object-cover"
            />
          </div>
          <div style={{
            background: "linear-gradient(135deg, #e85d04 0%, #ff7b00 100%)",
            borderRadius: "0.75rem",
            padding: "2rem",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1rem"
            }}>
              Join Our Musical Performance Team
            </h3>
            <p style={{
              lineHeight: "1.8",
              marginBottom: "1.5rem"
            }}>
              Are you a talented singer, instrumentalist, or dancer? We would love to hear from you!
            </p>
            <button
              onClick={() => handleOpenModal("performance")}
              style={{
                background: "white",
                color: "#e85d04",
                fontWeight: "600",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                transition: "all 0.2s"
              }}
            >
              {data.link1Title}
            </button>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #fef3e2 0%, #fff8f0 100%)",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          borderLeft: "4px solid #e85d04"
        }}>
          {data.introText2.split("\n\n").map((paragraph, index) => (
            <p key={index} style={{
              lineHeight: "1.8",
              fontSize: "1.1rem",
              color: "#333",
              marginBottom: index < data.introText2.split("\n\n").length - 1 ? "1rem" : 0
            }}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Section 3: Image 3 + Yellow Box (Looking for Partners) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem"
      }}>
        <div style={{
          borderRadius: "0.75rem",
          overflow: "hidden",
          height: "300px",
          background: "#f5f5f5"
        }}>
          <Image
            src={data.image3}
            alt="Cooperation 3"
            width={800}
            height={500}
            className="w-full h-full object-cover"
          />
        </div>
        <div style={{
          background: "linear-gradient(135deg, #e85d04 0%, #ff7b00 100%)",
          borderRadius: "0.75rem",
          padding: "2rem",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <h3 style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "1rem"
          }}>
            Looking for Partners
          </h3>
          <p style={{
            lineHeight: "1.8",
            marginBottom: "1.5rem"
          }}>
            Ready to collaborate? Click the button below to explore partnership opportunities with us.
          </p>
          <button
            onClick={() => handleOpenModal("business")}
            style={{
              background: "white",
              color: "#e85d04",
              fontWeight: "600",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              transition: "all 0.2s"
            }}
          >
            {data.link2Title}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CooperationSection() {
  const [data, setData] = useState<CooperationData>(DEFAULT_COOPERATION_DATA);

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem(COOPERATION_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setData({ ...DEFAULT_COOPERATION_DATA, ...parsed });
        } catch (e) {
          // Silent fail
        }
      }
    };

    loadData();
    window.addEventListener("storage", loadData);
    const interval = setInterval(loadData, 1000);

    return () => {
      window.removeEventListener("storage", loadData);
      clearInterval(interval);
    };
  }, []);

  return <CooperationContent data={data} />;
}

export { COOPERATION_STORAGE_KEY };
export type { CooperationData };
