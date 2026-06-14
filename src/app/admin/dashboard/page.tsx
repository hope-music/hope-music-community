"use client";

import Link from "next/link";

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

function DashboardCard({ title, description, href, icon, color }: DashboardCardProps) {
  return (
    <Link
      href={href}
      className={`block rounded-lg border p-6 transition-all hover:shadow-md ${color}`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const cards: DashboardCardProps[] = [
    {
      title: "Performance",
      description: "Manage stage productions and performance records",
      href: "/admin/productions",
      icon: "🎭",
      color: "border-orange-200 bg-white hover:border-orange-400",
    },
    {
      title: "Insights",
      description: "Manage sets, lighting, sound, and production resources",
      href: "/admin/stage-production",
      icon: "🎬",
      color: "border-purple-200 bg-white hover:border-purple-400",
    },
    {
      title: "Hope Studio",
      description: "Manage recording, mixing, and studio services",
      href: "/admin/hope-studio",
      icon: "🎵",
      color: "border-blue-200 bg-white hover:border-blue-400",
    },
    {
      title: "Interaction",
      description: "Manage software, hardware, and educational resources",
      href: "/admin/interaction",
      icon: "💻",
      color: "border-green-200 bg-white hover:border-green-400",
    },
    {
      title: "News",
      description: "Publish and manage news articles",
      href: "/admin/news",
      icon: "📰",
      color: "border-red-200 bg-white hover:border-red-400",
    },
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      href: "/admin/users",
      icon: "👥",
      color: "border-pink-200 bg-white hover:border-pink-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to the admin panel. Select a section to manage.
        </p>
      </div>

      {/* Management Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <DashboardCard key={card.href} {...card} />
        ))}
      </div>

      {/* Help Text */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="font-medium text-gray-900">Quick Tips</h3>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          <li>• Use the cards above to access each management section</li>
          <li>• All changes are saved automatically</li>
          <li>• You can manage comments from the Community page (in header navigation)</li>
          <li>• Remember to log out when finished</li>
        </ul>
      </div>
    </div>
  );
}
