"use client";

import { useState, useEffect } from "react";
import { Target, RefreshCw } from "lucide-react";
import BottomNav from "../components/BottomNav";
import ChallengeCard from "../components/ChallengeCard";
import RewardsDisplay from "../components/RewardsDisplay";

export default function GoalsPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadChallenges = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/challenges");
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
        setRewards(data.rewards || []);
        setTotalPoints(data.totalPoints || 0);
      }
    } catch (error) {
      console.error("Error loading challenges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleStartChallenge = async (challengeId: number) => {
    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      });

      if (response.ok) {
        await loadChallenges(); // Reload to show updated progress
      } else {
        const error = await response.json();
        alert(error.error || "Failed to start challenge");
      }
    } catch (error) {
      console.error("Error starting challenge:", error);
      alert("Failed to start challenge. Please try again.");
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gray-100 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Challenges & Rewards</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Complete challenges to earn badges and points
              </p>
            </div>
            <button
              onClick={loadChallenges}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
              aria-label="Refresh challenges"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Rewards Display */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <RewardsDisplay rewards={rewards} totalPoints={totalPoints} isLoading={isLoading} />
            </div>

            {/* Active Challenges */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Challenges</h2>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : challenges.filter((c) => c.progress && !c.isCompleted).length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No active challenges</p>
                  <p className="text-sm text-gray-500">
                    Start a challenge below to begin earning rewards!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {challenges
                    .filter((c) => c.progress && !c.isCompleted)
                    .map((challengeData) => (
                      <ChallengeCard
                        key={challengeData.challenge.id}
                        challenge={challengeData.challenge}
                        progress={challengeData.progress}
                        currentProgress={challengeData.currentProgress}
                        progressPercent={challengeData.progressPercent}
                        daysRemaining={challengeData.daysRemaining}
                        isCompleted={challengeData.isCompleted}
                        reward={challengeData.reward}
                        onStart={handleStartChallenge}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Available Challenges */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Challenges</h2>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : challenges.filter((c) => !c.progress && !c.isCompleted).length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-600">All challenges are in progress or completed!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {challenges
                    .filter((c) => !c.progress && !c.isCompleted)
                    .map((challengeData) => (
                      <ChallengeCard
                        key={challengeData.challenge.id}
                        challenge={challengeData.challenge}
                        progress={challengeData.progress}
                        currentProgress={challengeData.currentProgress}
                        progressPercent={challengeData.progressPercent}
                        daysRemaining={challengeData.daysRemaining}
                        isCompleted={challengeData.isCompleted}
                        reward={challengeData.reward}
                        onStart={handleStartChallenge}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Completed Challenges */}
            {challenges.filter((c) => c.isCompleted).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed Challenges</h2>
                <div className="space-y-4">
                  {challenges
                    .filter((c) => c.isCompleted)
                    .map((challengeData) => (
                      <ChallengeCard
                        key={challengeData.challenge.id}
                        challenge={challengeData.challenge}
                        progress={challengeData.progress}
                        currentProgress={challengeData.currentProgress}
                        progressPercent={challengeData.progressPercent}
                        daysRemaining={challengeData.daysRemaining}
                        isCompleted={challengeData.isCompleted}
                        reward={challengeData.reward}
                        onStart={handleStartChallenge}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
