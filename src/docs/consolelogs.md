chat-input.tsx:45 [CHAT-INPUT] Sending message: What's the weather like in London today?
chat-input.tsx:46 [CHAT-INPUT] Active user: {id: null, name: null}
chat-input.tsx:50 [CHAT-INPUT] Session ID: e12edebc-1896-42e2-afc5-8eb098975b23
chat-input.tsx:59 [CHAT-INPUT] Message sent, resetting input
2fetch.ts:15 Fetch finished loading: POST "https://zghrxfbjbuzqezasmkdx.supabase.co/rest/v1/chat_messages?select=*".
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
chat-message-utilities.ts:18 [CHAT-UTILITIES] Processing tool calls from database: {originalValue: null, type: 'object', isArray: false, stringified: 'null'}
chat-message-utilities.ts:102 [CHAT-UTILITIES] Converting DB row to ChatMessage: {messageId: '317aba1f-ac96-477b-adc8-7ad7f32f5a9d', originalToolCalls: null, processedToolCalls: undefined}
message-processor.ts:44 [MESSAGE-PROCESSOR] Processing user message: {messageLength: 40, sessionId: 'e12edebc-1896-42e2-afc5-8eb098975b23', userId: null, historyLength: 1}
tool-registry.ts:47 🧰 TOOL-REGISTRY: Providing 4 tool definitions: (4) ['get_weather', 'search_flights', 'search_hotels', 'manage_itinerary']
message-processor.ts:79 [MESSAGE-PROCESSOR] Streaming options prepared: {model: 'gpt-4o-mini', inputLength: 3, numTools: 4}
chat-client.ts:62 [CHAT-CLIENT] Streaming AI response with options: {model: 'gpt-4o-mini', inputLength: 3, toolsCount: 4, toolNames: Array(4), store: true}
chat-client.ts:81 [CHAT-CLIENT] Sending tools to OpenAI: (4) [{…}, {…}, {…}, {…}]
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: false, toolCallsType: 'object', toolCallsIsArray: false, toolCallsLength: 'undefined', …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: false, toolCallsType: 'object', toolCallsIsArray: false, toolCallsLength: 'undefined', …}
hot-reloader-client.tsx:371 [Fast Refresh] rebuilding
hot-reloader-client.tsx:116 [Fast Refresh] done in 698ms
chat-client.ts:105 [CHAT-CLIENT] API stream connection established
streaming-utils.ts:94 [CHAT-CLIENT] Creating readable stream from SSE response
streaming-utils.ts:144 [CHAT-CLIENT] Processing stream event #1: {type: 'response.created'}
streaming-utils.ts:212 [STREAM] First raw event: {"type":"response.created","response":{"id":"resp_67da4feb90ec81919800050631f1c7110366d86ec7d88722","object":"response","created_at":1742360555,"status":"in_progress","error":null,"incomplete_details":null,"instructions":null,"max_output_tokens":null,"model":"gpt-4o-mini-2024-07-18","output":[],"parallel_tool_calls":true,"previous_response_id":null,"reasoning":{"effort":null,"generate_summary":null},"store":true,"temperature":0.7,"text":{"format":{"type":"text"}},"tool_choice":"auto","tools":[{"type":"function","description":"Get current weather information for a location","name":"get_weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"City name or location to get weather for"},"units":{"type":"string","enum":["celsius","fahrenheit"],"description":"Temperature units (default: celsius)"}},"required":["location","units"],"additionalProperties":false},"strict":true},{"type":"function","description":"Search for flights between airports on specific dates","name":"search_flights","parameters":{"type":"object","properties":{"origin":{"type":"string","description":"Origin airport IATA code (e.g., LAX, JFK)"},"destination":{"type":"string","description":"Destination airport IATA code (e.g., LHR, CDG)"},"departureDate":{"type":"string","description":"Departure date in YYYY-MM-DD format"},"returnDate":{"type":"string","description":"Return date in YYYY-MM-DD format (optional for one-way flights)"},"cabinClass":{"type":"string","enum":["economy","premium_economy","business","first"],"description":"Preferred cabin class"},"adults":{"type":"integer","description":"Number of adult passengers"}},"required":["origin","destination","departureDate","returnDate","cabinClass","adults"],"additionalProperties":false},"strict":true},{"type":"function","description":"Search for hotels in a specific location for given dates","name":"search_hotels","parameters":{"type":"object","properties":{"location":{"type":"string","description":"Location name or coordinates (e.g., \"New York\" or \"40.7128,-74.0060\")"},"checkIn":{"type":"string","description":"Check-in date in YYYY-MM-DD format"},"checkOut":{"type":"string","description":"Check-out date in YYYY-MM-DD format"},"guests":{"type":"integer","description":"Number of guests"},"rooms":{"type":"integer","description":"Number of rooms"},"minPrice":{"type":"number","description":"Minimum price per night (optional)"},"maxPrice":{"type":"number","description":"Maximum price per night (optional)"},"amenities":{"type":"array","items":{"type":"string","enum":["pool","spa","gym","restaurant","wifi","parking","pet_friendly"]},"description":"Desired amenities (optional)"}},"required":["location","checkIn","checkOut","guests","rooms","minPrice","maxPrice","amenities"],"additionalProperties":false},"strict":true},{"type":"function","description":"Create, retrieve, update, or delete items in a travel itinerary","name":"manage_itinerary","parameters":{"type":"object","properties":{"action":{"type":"string","enum":["create","get","update","delete"],"description":"The action to perform on the itinerary"},"userId":{"type":"string","description":"The ID of the user who owns the itinerary"},"itineraryId":{"type":"string","description":"The ID of the itinerary (required for get, update, delete)"},"itineraryName":{"type":"string","description":"The name of the itinerary (required for create)"},"tripDates":{"type":"object","properties":{"startDate":{"type":"string","description":"Start date in YYYY-MM-DD format"},"endDate":{"type":"string","description":"End date in YYYY-MM-DD format"}},"required":["startDate","endDate"],"additionalProperties":false,"description":"Date range for the trip (required for create)"},"items":{"type":"array","items":{"type":"object","properties":{"id":{"type":"string","description":"ID of the itinerary item (required for update, delete)"},"type":{"type":"string","enum":["flight","hotel","activity","transportation","note"],"description":"Type of itinerary item"},"title":{"type":"string","description":"Title of the itinerary item"},"description":{"type":"string","description":"Description of the itinerary item"},"startDateTime":{"type":"string","description":"Start date and time in ISO 8601 format"},"endDateTime":{"type":"string","description":"End date and time in ISO 8601 format"},"location":{"type":"object","properties":{"name":{"type":"string"},"address":{"type":"string"},"coordinates":{"type":"object","properties":{"latitude":{"type":"number"},"longitude":{"type":"number"}},"required":["latitude","longitude"],"additionalProperties":false}},"required":["name","address","coordinates"],"additionalProperties":false,"description":"Location information for the itinerary item"},"details":{"type":"object","properties":{"confirmationCode":{"type":"string"},"price":{"type":"number"},"provider":{"type":"string"},"notes":{"type":"string"}},"required":["confirmationCode","price","provider","notes"],"additionalProperties":false,"description":"Additional details specific to the item type"}},"required":["id","type","title","description","startDateTime","endDateTime","location","details"],"additionalProperties":false},"description":"Itinerary items to create or update"}},"required":["action","userId","itineraryId","itineraryName","tripDates","items"],"additionalProperties":false},"strict":true}],"top_p":1,"truncation":"disabled","usage":null,"user":null,"metadata":{}}}
streaming-utils.ts:217 [STREAM] Event #0 type: response.created
streaming-utils.ts:320 [STREAM] Function call initiated: {"type":"response.output_item.added","output_index":0,"item":{"type":"function_call","id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","call_id":"call_a4tkroph3YFrCCX0BoWHUESN","name":"get_weather","arguments":"","status":"in_progress"}}
streaming-utils.ts:335 [STREAM] Function call added at index 0: {type: 'function_call', id: 'fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722', call_id: 'call_a4tkroph3YFrCCX0BoWHUESN', name: 'get_weather', arguments: '', …}
streaming-utils.ts:340 [STREAM] Function call argument delta: {"type":"response.function_call_arguments.delta","item_id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","output_index":0,"delta":"{\""}
streaming-utils.ts:349 [STREAM] Updated function call arguments: {index: 0, partial: '{"'}
streaming-utils.ts:340 [STREAM] Function call argument delta: {"type":"response.function_call_arguments.delta","item_id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","output_index":0,"delta":"location"}
streaming-utils.ts:349 [STREAM] Updated function call arguments: {index: 0, partial: '{"location'}
streaming-utils.ts:340 [STREAM] Function call argument delta: {"type":"response.function_call_arguments.delta","item_id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","output_index":0,"delta":"\":\""}
streaming-utils.ts:349 [STREAM] Updated function call arguments: {index: 0, partial: '{"location":"'}
streaming-utils.ts:340 [STREAM] Function call argument delta: {"type":"response.function_call_arguments.delta","item_id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","output_index":0,"delta":"London"}
streaming-utils.ts:349 [STREAM] Updated function call arguments: {index: 0, partial: '{"location":"London'}
streaming-utils.ts:144 [CHAT-CLIENT] Processing stream event #10: {type: 'response.function_call_arguments.delta'}
streaming-utils.ts:340 [STREAM] Function call argument delta: {"type":"response.function_call_arguments.delta","item_id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","output_index":0,"delta":"\",\""}
streaming-utils.ts:349 [STREAM] Updated function call arguments: {index: 0, partial: '{"location":"London","'}
streaming-utils.ts:340 [STREAM] Function call argument delta: {"type":"response.function_call_arguments.delta","item_id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","output_index":0,"delta":"units"}
streaming-utils.ts:349 [STREAM] Updated function call arguments: {index: 0, partial: '{"location":"London","units'}
streaming-utils.ts:340 [STREAM] Function call argument delta: {"type":"response.function_call_arguments.delta","item_id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","output_index":0,"delta":"\":\""}
streaming-utils.ts:349 [STREAM] Updated function call arguments: {index: 0, partial: '{"location":"London","units":"'}
streaming-utils.ts:340 [STREAM] Function call argument delta: {"type":"response.function_call_arguments.delta","item_id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","output_index":0,"delta":"c"}
streaming-utils.ts:349 [STREAM] Updated function call arguments: {index: 0, partial: '{"location":"London","units":"c'}
streaming-utils.ts:340 [STREAM] Function call argument delta: {"type":"response.function_call_arguments.delta","item_id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","output_index":0,"delta":"elsius"}
streaming-utils.ts:349 [STREAM] Updated function call arguments: {index: 0, partial: '{"location":"London","units":"celsius'}
streaming-utils.ts:340 [STREAM] Function call argument delta: {"type":"response.function_call_arguments.delta","item_id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","output_index":0,"delta":"\"}"}
streaming-utils.ts:349 [STREAM] Updated function call arguments: {index: 0, partial: '{"location":"London","units":"celsius"}'}
streaming-utils.ts:357 [STREAM] Function call arguments complete: {"type":"response.function_call_arguments.done","item_id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","output_index":0,"arguments":"{\"location\":\"London\",\"units\":\"celsius\"}"}
streaming-utils.ts:373 [STREAM] Executing function get_weather with args: {location: 'London', units: 'celsius'}
streaming-utils.ts:384 [STREAM] Function call completed: {"type":"response.output_item.done","output_index":0,"item":{"type":"function_call","id":"fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722","call_id":"call_a4tkroph3YFrCCX0BoWHUESN","name":"get_weather","arguments":"{\"location\":\"London\",\"units\":\"celsius\"}","status":"completed"}}
streaming-utils.ts:132 [CHAT-CLIENT] Received [DONE] event
message-processor.ts:220 [MESSAGE-PROCESSOR] Added function call from function_calls to UI arrays: {id: 'fc_67da4fec3e8081918bca212cd4d9e1190366d86ec7d88722', call_id: 'call_a4tkroph3YFrCCX0BoWHUESN', name: 'get_weather', type: 'function_call', arguments: '{"location":"London","units":"celsius"}'}
message-processor.ts:226 [MESSAGE-PROCESSOR] Executing tool calls: {count: 1}
message-processor.ts:234 [MESSAGE-PROCESSOR] Executing tool: get_weather {args: {…}}
tool-registry.ts:79 🔍 TOOL-REGISTRY: Looking for tool 'get_weather'
chat-client.ts:92 Fetch finished loading: POST "http://localhost:3000/api/openai".
streamAIResponse @ chat-client.ts:92
processUserMessage @ message-processor.ts:104
sendUserMessage @ session-chat-message-store.ts:130
await in sendUserMessage
handleSubmit @ chat-input.tsx:53
executeDispatch @ react-dom-client.development.js:16426
runWithFiberInDEV @ react-dom-client.development.js:1510
processDispatchQueue @ react-dom-client.development.js:16476
(anonymous) @ react-dom-client.development.js:17074
batchedUpdates$1 @ react-dom-client.development.js:3253
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16630
dispatchEvent @ react-dom-client.development.js:20716
dispatchDiscreteEvent @ react-dom-client.development.js:20684
tool-registry.ts:88 🚀 TOOL-REGISTRY: Executing tool 'get_weather' with args: {location: 'London', units: 'celsius'}
mock-weather.ts:34 ✅ MOCK-WEATHER TOOL CALLED: {args: {…}}
mock-weather.ts:40 📍 MOCK-WEATHER: Getting weather for London in celsius
mock-weather.ts:78 🌤️ MOCK-WEATHER RESULT: {location: 'London', temperature: {…}, conditions: 'Rainy', humidity: 86, timestamp: '2025-03-19T05:02:37.094Z'}
mock-weather.ts:79 mock-weather-execution: 500.697021484375 ms
tool-registry.ts:103 ✅ TOOL-REGISTRY: Tool 'get_weather' executed successfully with result: {location: 'London', temperature: {…}, conditions: 'Rainy', humidity: 86, timestamp: '2025-03-19T05:02:37.094Z'}
message-processor.ts:242 [MESSAGE-PROCESSOR] Tool execution complete: get_weather {result: {…}}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
message-processor.ts:267 [MESSAGE-PROCESSOR] Continuing conversation with tool outputs
message-processor.ts:310 [MESSAGE-PROCESSOR] Found function call in response.function_calls with call_id: call_a4tkroph3YFrCCX0BoWHUESN
message-processor.ts:323 [MESSAGE-PROCESSOR] Adding original function call with call_id: call_a4tkroph3YFrCCX0BoWHUESN
message-processor.ts:327 [MESSAGE-PROCESSOR] Adding function output for call_id: call_a4tkroph3YFrCCX0BoWHUESN
message-processor.ts:352 [MESSAGE-PROCESSOR] Sanitized follow-up messages: (6) [{…}, {…}, {…}, {…}, {…}, {…}]
tool-registry.ts:47 🧰 TOOL-REGISTRY: Providing 4 tool definitions: (4) ['get_weather', 'search_flights', 'search_hotels', 'manage_itinerary']
chat-client.ts:62 [CHAT-CLIENT] Streaming AI response with options: {model: 'gpt-4o-mini', inputLength: 6, toolsCount: 4, toolNames: Array(4), store: true}
chat-client.ts:81 [CHAT-CLIENT] Sending tools to OpenAI: (4) [{…}, {…}, {…}, {…}]
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
hot-reloader-client.tsx:371 [Fast Refresh] rebuilding
hot-reloader-client.tsx:116 [Fast Refresh] done in 43ms
chat-client.ts:105 [CHAT-CLIENT] API stream connection established
streaming-utils.ts:94 [CHAT-CLIENT] Creating readable stream from SSE response
streaming-utils.ts:144 [CHAT-CLIENT] Processing stream event #1: {type: 'response.created'}
streaming-utils.ts:212 [STREAM] First raw event: {"type":"response.created","response":{"id":"resp_67da4fed6bc88191a4239cf6e168fab50366d86ec7d88722","object":"response","created_at":1742360557,"status":"in_progress","error":null,"incomplete_details":null,"instructions":null,"max_output_tokens":null,"model":"gpt-4o-mini-2024-07-18","output":[],"parallel_tool_calls":true,"previous_response_id":null,"reasoning":{"effort":null,"generate_summary":null},"store":true,"temperature":0.7,"text":{"format":{"type":"text"}},"tool_choice":"auto","tools":[{"type":"function","description":"Get current weather information for a location","name":"get_weather","parameters":{"type":"object","properties":{"location":{"type":"string","description":"City name or location to get weather for"},"units":{"type":"string","enum":["celsius","fahrenheit"],"description":"Temperature units (default: celsius)"}},"required":["location","units"],"additionalProperties":false},"strict":true},{"type":"function","description":"Search for flights between airports on specific dates","name":"search_flights","parameters":{"type":"object","properties":{"origin":{"type":"string","description":"Origin airport IATA code (e.g., LAX, JFK)"},"destination":{"type":"string","description":"Destination airport IATA code (e.g., LHR, CDG)"},"departureDate":{"type":"string","description":"Departure date in YYYY-MM-DD format"},"returnDate":{"type":"string","description":"Return date in YYYY-MM-DD format (optional for one-way flights)"},"cabinClass":{"type":"string","enum":["economy","premium_economy","business","first"],"description":"Preferred cabin class"},"adults":{"type":"integer","description":"Number of adult passengers"}},"required":["origin","destination","departureDate","returnDate","cabinClass","adults"],"additionalProperties":false},"strict":true},{"type":"function","description":"Search for hotels in a specific location for given dates","name":"search_hotels","parameters":{"type":"object","properties":{"location":{"type":"string","description":"Location name or coordinates (e.g., \"New York\" or \"40.7128,-74.0060\")"},"checkIn":{"type":"string","description":"Check-in date in YYYY-MM-DD format"},"checkOut":{"type":"string","description":"Check-out date in YYYY-MM-DD format"},"guests":{"type":"integer","description":"Number of guests"},"rooms":{"type":"integer","description":"Number of rooms"},"minPrice":{"type":"number","description":"Minimum price per night (optional)"},"maxPrice":{"type":"number","description":"Maximum price per night (optional)"},"amenities":{"type":"array","items":{"type":"string","enum":["pool","spa","gym","restaurant","wifi","parking","pet_friendly"]},"description":"Desired amenities (optional)"}},"required":["location","checkIn","checkOut","guests","rooms","minPrice","maxPrice","amenities"],"additionalProperties":false},"strict":true},{"type":"function","description":"Create, retrieve, update, or delete items in a travel itinerary","name":"manage_itinerary","parameters":{"type":"object","properties":{"action":{"type":"string","enum":["create","get","update","delete"],"description":"The action to perform on the itinerary"},"userId":{"type":"string","description":"The ID of the user who owns the itinerary"},"itineraryId":{"type":"string","description":"The ID of the itinerary (required for get, update, delete)"},"itineraryName":{"type":"string","description":"The name of the itinerary (required for create)"},"tripDates":{"type":"object","properties":{"startDate":{"type":"string","description":"Start date in YYYY-MM-DD format"},"endDate":{"type":"string","description":"End date in YYYY-MM-DD format"}},"required":["startDate","endDate"],"additionalProperties":false,"description":"Date range for the trip (required for create)"},"items":{"type":"array","items":{"type":"object","properties":{"id":{"type":"string","description":"ID of the itinerary item (required for update, delete)"},"type":{"type":"string","enum":["flight","hotel","activity","transportation","note"],"description":"Type of itinerary item"},"title":{"type":"string","description":"Title of the itinerary item"},"description":{"type":"string","description":"Description of the itinerary item"},"startDateTime":{"type":"string","description":"Start date and time in ISO 8601 format"},"endDateTime":{"type":"string","description":"End date and time in ISO 8601 format"},"location":{"type":"object","properties":{"name":{"type":"string"},"address":{"type":"string"},"coordinates":{"type":"object","properties":{"latitude":{"type":"number"},"longitude":{"type":"number"}},"required":["latitude","longitude"],"additionalProperties":false}},"required":["name","address","coordinates"],"additionalProperties":false,"description":"Location information for the itinerary item"},"details":{"type":"object","properties":{"confirmationCode":{"type":"string"},"price":{"type":"number"},"provider":{"type":"string"},"notes":{"type":"string"}},"required":["confirmationCode","price","provider","notes"],"additionalProperties":false,"description":"Additional details specific to the item type"}},"required":["id","type","title","description","startDateTime","endDateTime","location","details"],"additionalProperties":false},"description":"Itinerary items to create or update"}},"required":["action","userId","itineraryId","itineraryName","tripDates","items"],"additionalProperties":false},"strict":true}],"top_p":1,"truncation":"disabled","usage":null,"user":null,"metadata":{}}}
streaming-utils.ts:217 [STREAM] Event #0 type: response.created
streaming-utils.ts:446 [STREAM] Unknown event type: response.content_part.added {"type":"response.content_part.added","item_id":"msg_67da4fee78488191acbf97efe3598b920366d86ec7d88722","output_index":0,"content_index":0,"part":{"type":"output_text","text":"","annotations":[]}}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
streaming-utils.ts:144 [CHAT-CLIENT] Processing stream event #10: {type: 'response.output_text.delta'}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
streaming-utils.ts:144 [CHAT-CLIENT] Processing stream event #20: {type: 'response.output_text.delta'}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
streaming-utils.ts:217 [STREAM] Event #20 type: response.output_text.delta
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
streaming-utils.ts:144 [CHAT-CLIENT] Processing stream event #30: {type: 'response.output_text.delta'}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
streaming-utils.ts:144 [CHAT-CLIENT] Processing stream event #40: {type: 'response.output_text.delta'}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
streaming-utils.ts:217 [STREAM] Event #40 type: response.output_text.delta
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: true, toolCallsType: 'object', toolCallsIsArray: true, toolCallsLength: 0, …}
streaming-utils.ts:446 [STREAM] Unknown event type: response.output_text.done {"type":"response.output_text.done","item_id":"msg_67da4fee78488191acbf97efe3598b920366d86ec7d88722","output_index":0,"content_index":0,"text":"Today in London, the weather is rainy with a temperature of 15°C. The humidity level is quite high at 86%. If you're heading out, be sure to bring an umbrella!"}
streaming-utils.ts:446 [STREAM] Unknown event type: response.content_part.done {"type":"response.content_part.done","item_id":"msg_67da4fee78488191acbf97efe3598b920366d86ec7d88722","output_index":0,"content_index":0,"part":{"type":"output_text","text":"Today in London, the weather is rainy with a temperature of 15°C. The humidity level is quite high at 86%. If you're heading out, be sure to bring an umbrella!","annotations":[]}}
streaming-utils.ts:132 [CHAT-CLIENT] Received [DONE] event
chat-message-service.ts:188 [CHAT-MESSAGE-SERVICE] Finalizing message with tool calls: {messageId: '42f7a632-2f54-451b-b440-8d895d3f6c22', toolCallsPresent: true, toolCallsCount: 0, toolCallsArray: true}
chat-message-service.ts:212 [CHAT-MESSAGE-SERVICE] Storing formatted tool calls: {isArray: false, length: 0, sample: 'none'}
chat-client.ts:92 Fetch finished loading: POST "http://localhost:3000/api/openai".
streamAIResponse @ chat-client.ts:92
onComplete @ message-processor.ts:377
await in onComplete
(anonymous) @ streaming-utils.ts:204
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:450
Promise.then
processEvents @ streaming-utils.ts:202
(anonymous) @ streaming-utils.ts:468
processStreamingEvents @ streaming-utils.ts:200
processUserMessage @ message-processor.ts:107
await in processUserMessage
sendUserMessage @ session-chat-message-store.ts:130
await in sendUserMessage
handleSubmit @ chat-input.tsx:53
executeDispatch @ react-dom-client.development.js:16426
runWithFiberInDEV @ react-dom-client.development.js:1510
processDispatchQueue @ react-dom-client.development.js:16476
(anonymous) @ react-dom-client.development.js:17074
batchedUpdates$1 @ react-dom-client.development.js:3253
dispatchEventForPluginEventSystem @ react-dom-client.development.js:16630
dispatchEvent @ react-dom-client.development.js:20716
dispatchDiscreteEvent @ react-dom-client.development.js:20684
fetch.ts:15 Fetch finished loading: PATCH "https://zghrxfbjbuzqezasmkdx.supabase.co/rest/v1/chat_messages?id=eq.42f7a632-2f54-451b-b440-8d895d3f6c22&select=*".
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
chat-message-service.ts:231 [CHAT-MESSAGE-SERVICE] Message updated, tool_calls in result: {resultHasToolCalls: false, resultToolCallsType: 'object', resultToolCallsIsArray: false, resultToolCallsLength: 'N/A'}
fetch.ts:15 Fetch finished loading: GET "https://zghrxfbjbuzqezasmkdx.supabase.co/rest/v1/chat_messages?select=*&session_id=eq.e12edebc-1896-42e2-afc5-8eb098975b23&order=timestamp.asc&offset=0&limit=20".
(anonymous) @ fetch.ts:15
(anonymous) @ fetch.ts:46
fulfilled @ fetch.ts:2
Promise.then
step @ fetch.ts:2
(anonymous) @ fetch.ts:2
push.[project]/node_modules/@supabase/supabase-js/dist/module/lib/fetch.js [app-client] (ecmascript).__awaiter @ fetch.ts:2
(anonymous) @ fetch.ts:34
then @ PostgrestBuilder.ts:101
chat-message-service.ts:46 [CHAT-MESSAGE-SERVICE] Processing message tool calls: {messageId: '317aba1f-ac96-477b-adc8-7ad7f32f5a9d', hasToolCalls: false, toolCallsType: 'object', toolCallsIsArray: false}
chat-message-service.ts:46 [CHAT-MESSAGE-SERVICE] Processing message tool calls: {messageId: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: false, toolCallsType: 'object', toolCallsIsArray: false}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: false, toolCallsType: 'object', toolCallsIsArray: false, toolCallsLength: 'undefined', …}
chat-message-item.tsx:105 [CHAT-MESSAGE-ITEM] Message properties: {id: '42f7a632-2f54-451b-b440-8d895d3f6c22', hasToolCalls: false, toolCallsType: 'object', toolCallsIsArray: false, toolCallsLength: 'undefined', …}