import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getCurrentTemperature(args: { location: string }) {
  const location = args.location;
  const API_KEY = process.env.WEATHER_API_KEY;
  const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}
`;

  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  console.log("we have an error here");
}

// define func declaration for the model
const weatherFunctionDeclaration = {
  name: "get_current_temperature",
  description: "Gets the current temperature for given location",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: "The City name, e.g. San Francisco",
      },
    },
    required: ["location"],
  },
};

// send request with function declarations
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "What's the temperature in pune?",
  config: {
    tools: [
      {
        functionDeclarations: [weatherFunctionDeclaration],
      },
    ],
  },
});

// check for function calls in the response
if (response.functionCalls && response.functionCalls.length > 0) {
  const aiResponse = response;
  console.log("AI Response", aiResponse);
  const functionCall = response.functionCalls[0]; // assuming one func call
  console.log(`Function to call ${functionCall.name}`);
  console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);

  try {
    const result = await getCurrentTemperature(
      functionCall.args as { location: string }
    );
    console.log("weather data", result);

    // send data back to ai
    const followUpResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { role: "user", parts: [{ text: "What's the temperature in pune?" }] },
        { role: "model", parts: [{ functionCall: functionCall }] },
        {
          role: "user",
          parts: [{ text: `Function results ${JSON.stringify(result)}` }],
        },
      ],
    });
    console.log("final AI response", followUpResponse.text);
  } catch (error) {
    console.error("Error processing the weather request", error);
  }
} else {
  console.log("No func call found in the response");
  console.log(response.text);
}
