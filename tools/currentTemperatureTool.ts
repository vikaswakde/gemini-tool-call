import { Type } from "@google/genai";

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

export default weatherFunctionDeclaration;
