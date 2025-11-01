"use client";

import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { useState } from "react";

export default function Home() {
  return (
    <>
        <Authenticated>
        <Dashboard />
        </Authenticated>
        <Unauthenticated>
        <Landing />
        </Unauthenticated>
    </>
  );
}

function Landing() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
          Run better standups and meetings with an AI project manager
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Create Recall bots, assign them to meetings, and search your meeting docs
          semantically. All powered by Convex, Next.js, and Clerk.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
      <SignInButton mode="modal">
            <button className="inline-flex items-center rounded-md bg-slate-900 text-white px-5 py-3 text-sm font-medium shadow-sm hover:bg-slate-800">
              Get started
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
            <button className="inline-flex items-center rounded-md bg-white text-slate-900 ring-1 ring-inset ring-slate-200 px-5 py-3 text-sm font-medium hover:bg-slate-50">
              Create account
        </button>
      </SignUpButton>
    </div>
      </div>

      <div className="mx-auto max-w-6xl mt-16 grid gap-6 sm:grid-cols-2">
        <FeatureCard
          title="Recall bots"
          description="Spin up project bots and assign them to recurring or ad-hoc meetings."
        />
        <FeatureCard
          title="Integrations"
          description="Connect Hyperspell and more to sync your meeting platforms."
        />
        <FeatureCard
          title="Docs & search"
          description="All meeting notes are saved to Convex with semantic search via Moss."
        />
        <FeatureCard
          title="Secure by default"
          description="Auth with Clerk and per-user scoping for projects, bots, and meetings."
        />
      </div>
    </section>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow transition-shadow">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    );
  }

function Dashboard() {
  const projects = useQuery(api.projects.list) ?? [];
  const createProject = useMutation(api.projects.create);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    await createProject({
      name: projectName,
      description: projectDescription || undefined,
    });
    setProjectName("");
    setProjectDescription("");
    setShowCreateForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
        >
          {showCreateForm ? "Cancel" : "+ New Project"}
        </button>
          </div>

      {showCreateForm && (
        <div className="bg-white border border-slate-200 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white border-slate-300"
            />
            <textarea
              placeholder="Description (optional)"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white border-slate-300"
              rows={3}
            />
            <button
              onClick={handleCreateProject}
              className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
            >
              Create Project
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
          <p className="text-slate-600 mb-4">
            No projects yet. Create your first project to get started!
          </p>
      </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
              {project.description && (
                <p className="text-slate-600 text-sm mb-4">
                  {project.description}
                </p>
              )}
              <p className="text-xs text-slate-500">
                Created {new Date(project._creationTime).toLocaleDateString()}
              </p>
            </Link>
          ))}
    </div>
      )}
    </div>
  );
}
