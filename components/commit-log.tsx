"use client"

import React, { useState, useEffect } from 'react';

interface Commit {
  id: string;
  commit_message: string;
  difficulty_of_commit: number;
  commit_timestamp: string;
}

const CommitLog = ({ projectId }: { projectId: string }) => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);

  //do i really need useEffect here? 
  useEffect(() => {
    const fetchCommits = async () => {
      try {
        // Replace with your actual backend URL/Ngrok URL
        console.log("Entered fetch commits with projectId:", projectId);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/project-progress/${projectId}/commits`, {
          credentials: "include"
        });
        const data = await response.json();
        console.log("Fetched commits data:", data);
        if (data.success) setCommits(data.data);
      } catch (err) {
        console.error("Failed to fetch commits:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchCommits();
  }, [projectId]);

  if (loading) return <div className="p-4 text-center animate-pulse text-gray-500">Loading commit logs...</div>;
  if (commits.length === 0) return <div className="p-4 text-center text-gray-500">No commits recorded yet.</div>;

  return (
    <div className="space-y-4">
      {commits.map((entry) => (
        <div key={entry.id} className="bg-gray-100 p-3 rounded-lg border-l-4 border-blue-500">
          <p className="font-semibold text-gray-900">{entry.commit_message}</p>
          <div className="flex justify-between mt-2 items-center">
            {/* <span className={`text-xs px-2 py-1 rounded ${
              entry.difficulty_of_commit === 0 ? 'bg-green-100 text-green-700' : 
              entry.difficulty_of_commit === 1 ? 'bg-yellow-100 text-yellow-700' : 
              'bg-red-100 text-red-700'
            }`}>
              {entry.difficulty_of_commit === 0 ? 'Easy' : entry.difficulty_of_commit === 1 ? 'Medium' : 'Hard'}
            </span> */}
            <p className="text-xs text-gray-500">
              {new Date(entry.commit_timestamp).toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommitLog;