# Letta Agent Setup for OwnIt Coach

This guide explains how to set up the Letta agent with memory blocks for the OwnIt health coach.

## Prerequisites

1. **Letta Cloud Account**: Sign up at [app.letta.com](https://app.letta.com)
2. **API Key**: Get your API key from [https://app.letta.com/api-keys](https://app.letta.com/api-keys)

## Setup Steps

### 1. Add Environment Variables

Add the following to your `.env.local` file:

```bash
LETTA_API_KEY=your_api_key_here
```

### 2. Initialize the Agent

Run the initialization script to create the Letta agent:

```bash
npm run letta:init
```

This script will:
- Create a new Letta agent with memory blocks (persona, human, health_context)
- Configure the agent with GPT-4.1 and text-embedding-3-small
- Output the agent ID that you need to add to your environment

### 3. Add Agent ID to Environment

After running the init script, add the agent ID to your `.env.local`:

```bash
LETTA_AGENT_ID=agent-xxxxxxxxx
```

### 4. Restart Your Development Server

```bash
npm run dev
```

## How It Works

### Memory Blocks

The agent is configured with three memory blocks:

1. **persona**: Defines the coach's personality and behavior
   - Warm, encouraging, and supportive
   - Data-driven but empathetic
   - Focused on actionable insights

2. **human**: Describes the user and their health tracking context
   - User tracks health metrics (weight, steps, sleep, calories, etc.)
   - User may ask about trends, patterns, recommendations, goals

3. **health_context**: Stores context about the health tracking system
   - Information about available data and how to access it

### Stateful Conversations

Unlike stateless chat APIs, Letta agents maintain conversation history server-side. This means:
- The agent remembers previous conversations
- You only send the new user message (not full conversation history)
- The agent learns and adapts over time

### Streaming Responses

The chat interface uses streaming to provide real-time responses as the agent generates them.

## Troubleshooting

### Agent Not Found Error

If you see "LETTA_AGENT_ID not configured":
1. Make sure you've run `npm run letta:init`
2. Check that `LETTA_AGENT_ID` is in your `.env.local`
3. Restart your dev server after adding the environment variable

### API Key Issues

If you see authentication errors:
1. Verify your `LETTA_API_KEY` is correct
2. Check that your API key has not expired
3. Ensure you have sufficient quota in your Letta Cloud account

### Agent Already Exists

If the init script finds an existing agent ID in your environment, it will use that agent instead of creating a new one. To create a new agent:
1. Remove `LETTA_AGENT_ID` from `.env.local`
2. Run `npm run letta:init` again

## Advanced Configuration

### Custom Memory Blocks

You can modify the memory blocks in `scripts/init-letta-agent.ts` to customize the agent's behavior. For example, you could add:
- User preferences
- Health goals
- Medical history (if user provides it)
- Dietary restrictions

### Model Selection

The default configuration uses:
- Model: `openai/gpt-4.1` (high performance)
- Embedding: `openai/text-embedding-3-small` (cost-effective)

You can change these in the init script if needed. See the [Letta Leaderboard](https://docs.letta.com/leaderboard) for model recommendations.

### Tools

The agent is configured with built-in tools:
- `web_search`: Search the web for information
- `run_code`: Run code in a sandbox for calculations/analysis

These tools are automatically available to the agent and can be used when needed.

## Resources

- [Letta Documentation](https://docs.letta.com/)
- [Letta API Reference](https://docs.letta.com/api-reference/overview)
- [Letta Discord](https://discord.gg/letta)
- [Letta Cloud Dashboard](https://app.letta.com)
