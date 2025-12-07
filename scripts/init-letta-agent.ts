/**
 * Script to initialize/create a Letta agent for the OwnIt health coach
 * Run this once to create the agent, then use the agent ID in your environment
 */

import Letta from "@letta-ai/letta-client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function initLettaAgent() {
  const apiKey = process.env.LETTA_API_KEY;
  
  if (!apiKey) {
    console.error("❌ LETTA_API_KEY not found in environment variables");
    console.log("Please add LETTA_API_KEY to your .env.local file");
    console.log("Get your API key from: https://app.letta.com/api-keys");
    process.exit(1);
  }

  const client = new Letta({ apiKey });

  try {
    // Check if agent already exists (by checking for existing agent ID in env)
    const existingAgentId = process.env.LETTA_AGENT_ID;
    
    if (existingAgentId) {
      console.log(`🔍 Checking existing agent: ${existingAgentId}`);
      try {
        const existingAgent = await client.agents.get(existingAgentId);
        console.log("✅ Agent already exists!");
        console.log(`Agent ID: ${existingAgent.id}`);
        console.log(`Agent Name: ${existingAgent.name || "Unnamed"}`);
        console.log("\n📝 Add this to your .env.local file:");
        console.log(`LETTA_AGENT_ID=${existingAgent.id}`);
        return;
      } catch (error: any) {
        if (error.status === 404) {
          console.log("⚠️  Agent ID in env not found, creating new agent...");
        } else {
          throw error;
        }
      }
    }

    // Create new agent with memory blocks
    console.log("🚀 Creating new Letta agent for OwnIt Coach...");
    
    const agent = await client.agents.create({
      memory_blocks: [
        {
          label: "persona",
          value: `You are the OwnIt Health Coach, a friendly and knowledgeable AI assistant specializing in health and wellness. Your personality is:
- Warm, encouraging, and supportive
- Data-driven but empathetic
- Focused on actionable insights
- Respectful of user privacy and boundaries
- Proactive in identifying patterns and trends
- Clear and concise in explanations

You help users understand their health data, identify patterns, set goals, and make informed decisions about their wellness journey.`,
        },
        {
          label: "human",
          value: `The user is someone tracking their health data through the OwnIt app. They log metrics like:
- Weight, steps, sleep hours
- Calories and protein intake
- Mood and energy levels
- Health records over time

They may ask questions about:
- Their health trends and patterns
- How to interpret their data
- Recommendations based on their metrics
- Goal setting and progress tracking
- Understanding correlations between different health metrics`,
        },
        {
          label: "health_context",
          value: "The user's health data is stored in a database and can be accessed when needed. Focus on providing insights based on the data they share or ask about.",
          description: "Stores context about the user's health tracking system and available data",
        },
      ],
      tools: ["web_search", "run_code"],
      model: "openai/gpt-4.1",
      embedding: "openai/text-embedding-3-small",
    });

    console.log("\n✅ Agent created successfully!");
    console.log(`Agent ID: ${agent.id}`);
    console.log("\n📝 Add this to your .env.local file:");
    console.log(`LETTA_AGENT_ID=${agent.id}`);
    console.log("\n💡 The agent will maintain conversation history and learn about the user over time.");
    
  } catch (error: any) {
    console.error("❌ Error creating agent:", error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

initLettaAgent();
