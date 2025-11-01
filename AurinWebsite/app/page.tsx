"use client";

import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { SignUpButton, SignInButton, UserButton } from "@clerk/nextjs";
import { useState } from "react";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Project Manager Voice Agent
        </Link>
        <div className="flex items-center gap-4">
          <Authenticated>
            <nav className="flex gap-4">
              <Link href="/projects" className="hover:underline">Projects</Link>
              <Link href="/bots" className="hover:underline">Bots</Link>
              <Link href="/meetings" className="hover:underline">Meetings</Link>
              <Link href="/integrations" className="hover:underline">Integrations</Link>
            </nav>
          </Authenticated>
        <UserButton />
        </div>
      </header>
      <main className="p-8">
        <Authenticated>
          <Dashboard />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </>
  );
}

function SignInForm() {
  return (
    <div className="flex flex-col gap-8 w-96 mx-auto items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-center">
        Project Manager Voice Agent
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400">
        Manage your standups and meetings with AI-powered bots
      </p>
      <div className="flex flex-col gap-4 w-full">
      <SignInButton mode="modal">
          <button className="bg-foreground text-background px-6 py-3 rounded-md font-semibold hover:opacity-90 transition-opacity w-full">
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
          <button className="bg-slate-200 dark:bg-slate-800 text-foreground px-6 py-3 rounded-md font-semibold hover:opacity-90 transition-opacity w-full">
          Sign up
        </button>
      </SignUpButton>
    </div>
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
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? "Cancel" : "+ New Project"}
        </button>
          </div>

      {showCreateForm && (
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
            />
            <textarea
              placeholder="Description (optional)"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
              rows={3}
            />
            <button
              onClick={handleCreateProject}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No projects yet. Create your first project to get started!
          </p>
      </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              {project.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {project.description}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Created {new Date(project._creationTime).toLocaleDateString()}
              </p>
            </Link>
          ))}
    </div>
      )}
    </div>
  );
}
