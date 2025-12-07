# Letta Integration Testing Guide

## Testing the Letta Agent

We've created a test script to verify the Letta messaging functionality. This script tests:

1. **Non-streaming messages** - Send a message and get a complete response
2. **Token streaming** - Stream responses character by character for real-time UX
3. **Message history retrieval** - Fetch previous conversation history

### Running the Tests

```bash
npm run letta:test
```

### What the Test Does

The test script (`scripts/test-letta-messages.ts`) performs three tests:

1. **Test 1: Non-streaming message**
   - Sends "Hello! Say hi back in one word."
   - Verifies the agent responds
   - Shows the complete response

2. **Test 2: Token streaming**
   - Sends "Count from 1 to 3, one number per line."
   - Streams the response token by token
   - Shows each delta/chunk as it arrives
   - Verifies final accumulated content

3. **Test 3: Message history**
   - Retrieves the last 10 messages
   - Shows message types and content
   - Verifies history is accessible

### Understanding the Results

#### Non-streaming Response
```
📝 Test 1: Non-streaming message
✅ Response received:
Messages count: 1
  [0] assistant_message: Hi!
```

#### Streaming Response
```
📝 Test 2: Token streaming message
🌊 Streaming chunks:
  [Chunk 1] Delta: "1"
  [Chunk 2] Delta: " 
"
  ...
✅ Streaming complete!
Final accumulated content: "1\n2\n3"
```

## Letta API Methods Used

### Sending Messages

```typescript
// Non-streaming
const response = await client.agents.messages.create(agentId, {
  messages: [{ role: "user", content: "Your message" }],
});

// Token streaming
const stream = await client.agents.messages.stream(agentId, {
  messages: [{ role: "user", content: "Your message" }],
  stream_tokens: true,  // Enable token-level streaming
});

for await (const chunk of stream) {
  if (chunk.message_type === "assistant_message") {
    console.log(chunk.content);
  }
}
```

### Retrieving History

```typescript
const response = await client.agents.messages.list(agentId, {
  limit: 100,
});

// Response structure: { items: [...], options: {...}, ... }
const messages = response.items;
```

## Message Types

Letta sends different message types in the stream:

- `user_message` - User's input
- `assistant_message` - Agent's response (contains `content`)
- `reasoning_message` - Agent's internal reasoning (contains `reasoning`)
- `tool_call_message` - When agent calls a tool (contains `tool_call`)
- `tool_return_message` - Tool execution result (contains `tool_return`)
- `usage_statistics` - Token usage stats

## Troubleshooting

### Error: "LETTA_API_KEY not configured"
Make sure you have `LETTA_API_KEY` in your `.env.local` file.

### Error: "LETTA_AGENT_ID not configured"
Run `npm run letta:init` to create an agent and add the ID to `.env.local`.

### Content appears incomplete
- Check that `stream_tokens: true` is set for token streaming
- Verify the frontend is accumulating deltas correctly
- Look at the backend logs for delta values

### History not loading
- The response structure is `response.items`, not `response.messages`
- Make sure the agent has had at least one conversation
- Check network tab for API response structure

## Next Steps

1. Test the chat interface at `/coach`
2. Send messages and verify streaming works
3. Refresh the page and verify history loads
4. Check that the complete message is saved after streaming

## Resources

- [Letta Documentation](https://docs.letta.com/)
- [Letta API Reference](https://docs.letta.com/api-reference/overview)
- [Letta Discord](https://discord.gg/letta)
