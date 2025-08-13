import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY });

export const generateResult = async (userPrompt) => {
  try {
    const isCasual =
      /^(hi|hello|hey|how are you|what'?s up|how’s it going|good (morning|evening)|yo)\b/i.test(
        userPrompt.trim()
      );

    const contents = isCasual
      ? [
          {
            role: "user",
            text: userPrompt,
          },
        ]
      : [
          {
            role: "system",
            text: `
            You are an expert in MERN and Development with 10 years of experience.
            Provide codes and function in order as per the prompt without any "\n"s and unnecessary details.
            Provide answers in simple language. 
            Handle edge cases and errors.
            Follow industry best practices.
            If the prompt is about any code generation provide me the tree structure for better understanding.
            
               If user ask que based on code follow below example:
              Example:
              user: Create an express application
              response:{

                  "text":"this is your fileTree structure of the expres server"
                  "fileTree":{
                  "app.js":{
                  content:"
                  const express = require('express');
                  const app = express();
                  const PORT = 3000;

                  // Middleware to parse JSON
                  app.use(express.json());

                  // Basic route
                  app.get('/', (req, res) => {
                    res.send('Hello from Express Server!');
                  });

                  // Start server
                  app.listen(PORT);
                  "
                },
                "package.json":{
                  content:"{
                    "name": "express-server",
                    "version": "1.0.0",
                    "description": "A simple Express.js server",
                    "main": "server.js",
                    "scripts": {
                      "start": "node server.js"
                    },
                    "keywords": ["express", "nodejs", "server"],
                    "author": "",
                    "license": "ISC",
                    "dependencies": {
                    "express": "^4.18.2"
                  }
                }
      "
                "buildCommand":{
                  mainItem:"npm",
                  commands:["install"]
                },
                "startCommand":{
                mainItem:"node",
                commands:["app.js"]
                }
                }
                }
                
          }

            `,
          },
          {
            role: "user",
            text: userPrompt,
          },
        ];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
    });

    return response.text; // or response.text depending on your SDK version
  } catch (error) {
    console.error("Error generating content:", error);
    return { message: error.message };
  }
};
