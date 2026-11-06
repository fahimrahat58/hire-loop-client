import React from "react";
import { MapPin, Briefcase, Banknote, ArrowRight } from "lucide-react";

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  type: string;
  salary: string;
}

const jobs: Job[] = [
  {
    id: 1,
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    type: "Hybrid",
    salary: "€25–€40/hour",
  },
  {
    id: 2,
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    type: "Hybrid",
    salary: "€25–€40/hour",
  },
  {
    id: 3,
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    type: "Hybrid",
    salary: "€25–€40/hour",
  },
  {
    id: 4,
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    type: "Hybrid",
    salary: "€25–€40/hour",
  },
  {
    id: 5,
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    type: "Hybrid",
    salary: "€25–€40/hour",
  },
  {
    id: 6,
    title: "Frontend Developer",
    description:
      "Showcase your commitment to diversity and inclusion by highlighting initiatives",
    location: "New York, USA",
    type: "Hybrid",
    salary: "€25–€40/hour",
  },
];

export default function SmartJobDiscovery() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          <span>◆</span>
          <span>SMART JOB DISCOVERY</span>
          <span>◆</span>
        </div>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          The roles you'd never
          <br />
          find by searching
        </h2>
      </div>

      {/* Job Cards Grid */}
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#1c1a1d]/60 p-6 backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#221f24]/70"
          >
            <div>
              <h3 className="text-xl font-bold text-white">{job.title}</h3>
              <p className="mt-3 text-xs leading-relaxed text-gray-400">
                {job.description}
              </p>

              {/* Badges / Meta Info */}
              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[11px]">
                  <MapPin className="h-3.5 w-3.5 text-purple-400" />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[11px]">
                  <Briefcase className="h-3.5 w-3.5 text-purple-400" />
                  {job.type}
                </span>
              </div>

              {/* Salary Tag */}
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[11px] text-gray-300">
                  <Banknote className="h-3.5 w-3.5 text-purple-400" />
                  {job.salary}
                </span>
              </div>
            </div>

            {/* Apply Button */}
            <div className="mt-8">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white transition-colors hover:text-indigo-400"
              >
                Apply Now
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-12 flex justify-center">
        <button
          type="button"
          className="rounded-xl bg-white px-6 py-3 text-xs font-semibold text-black transition-all hover:bg-gray-200"
        >
          View all job open
        </button>
      </div>
    </section>
  );
}