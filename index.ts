import { GoogleGenAI, Type } from "@google/genai";
import getCurrentTemperature from "./services/getCurrentTemperature";
import weatherFunctionDeclaration from "./tools/currentTemperatureTool";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const userQuestion = "What's the temperature in San Francisco?";

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: userQuestion,
  config: {
    tools: [
      {
        functionDeclarations: [weatherFunctionDeclaration],
      },
    ],
  },
});

if (response.functionCalls && response.functionCalls.length > 0) {
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
        { role: "user", parts: [{ text: userQuestion }] },
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
