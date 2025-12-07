/**
 * Test script to verify Letta messaging functionality
 */

import Letta from "@letta-ai/letta-client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testLettaMessages() {
  const apiKey = process.env.LETTA_API_KEY;
  const agentId = process.env.LETTA_AGENT_ID;
  
  if (!apiKey) {
    console.error("❌ LETTA_API_KEY not found");
    process.exit(1);
  }

  if (!agentId) {
    console.error("❌ LETTA_AGENT_ID not found");
    process.exit(1);
  }

  const client = new Letta({ apiKey });

  console.log("🧪 Testing Letta messaging functionality...\n");

  try {
    // Test 1: Send a simple message without streaming
    console.log("📝 Test 1: Non-streaming message");
    const response = await client.agents.messages.create(agentId, {
      messages: [{ role: "user", content: "Hello! Say hi back in one word." }],
    });

    console.log("✅ Response received:");
    console.log(`Messages count: ${response.messages.length}`);
    response.messages.forEach((msg: any, idx: number) => {
      console.log(`  [${idx}] ${msg.message_type}: ${msg.content?.substring(0, 100) || msg.reasoning?.substring(0, 100) || 'N/A'}`);
    });

    console.log("\n" + "=".repeat(60) + "\n");

    // Test 2: Send a message with token streaming
    console.log("📝 Test 2: Token streaming message");
    const stream = await client.agents.messages.stream(agentId, {
      messages: [{ role: "user", content: "Count from 1 to 3, one number per line." }],
      stream_tokens: true,
    });

    let accumulatedContent = "";
    let chunkCount = 0;

    console.log("🌊 Streaming chunks:");
    for await (const chunk of stream) {
      chunkCount++;
      if (chunk.message_type === "assistant_message") {
        const content = chunk.content || "";
        if (content.length > accumulatedContent.length) {
          const delta = content.slice(accumulatedContent.length);
          console.log(`  [Chunk ${chunkCount}] Delta: "${delta}"`);
          accumulatedContent = content;
        }
      } else if (chunk.message_type === "reasoning_message") {
        console.log(`  [Chunk ${chunkCount}] Reasoning: ${chunk.reasoning?.substring(0, 50) || 'N/A'}`);
      } else if (chunk.message_type === "tool_call_message") {
        console.log(`  [Chunk ${chunkCount}] Tool call: ${chunk.tool_call?.name || 'N/A'}`);
      }
    }

    console.log(`\n✅ Streaming complete!`);
    console.log(`Total chunks: ${chunkCount}`);
    console.log(`Final accumulated content: "${accumulatedContent}"`);

    console.log("\n" + "=".repeat(60) + "\n");

    // Test 3: Retrieve message history
    console.log("📝 Test 3: Retrieve message history");
    const history = await client.agents.messages.list(agentId, {
      limit: 10,
    });

    console.log(`✅ History retrieved:`);
    if (history && Array.isArray(history.messages)) {
      console.log(`Total messages: ${history.messages.length}`);
      history.messages.slice(0, 5).forEach((msg: any, idx: number) => {
        console.log(`  [${idx}] ${msg.message_type}: ${msg.content?.substring(0, 50) || msg.reasoning?.substring(0, 50) || 'N/A'}`);
      });
    } else if (Array.isArray(history)) {
      console.log(`Total messages: ${history.length}`);
      history.slice(0, 5).forEach((msg: any, idx: number) => {
        console.log(`  [${idx}] ${msg.message_type}: ${msg.content?.substring(0, 50) || msg.reasoning?.substring(0, 50) || 'N/A'}`);
      });
    } else {
      console.log("History structure:", Object.keys(history || {}));
    }

    console.log("\n✅ All tests passed!");
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testLettaMessages();
