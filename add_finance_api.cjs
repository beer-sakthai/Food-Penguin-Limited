const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

const apiContent = `

// --- Finance P&L Analysis API ---
app.post("/api/gemini/finance-analysis", async (req, res) => {
  const ai = getAiClient();
  if (!ai) {
    return res.status(500).json({ error: "Gemini client not initialized" });
  }

  const { plan, actual } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: \`Analyze the structural variance between our Target Plan and Actual Use percentages.

Plan Structure:
\${plan.map(p => \`\${p.name}: \${p.value}%\`).join(', ')}

Actual Use Structure:
\${actual.map(a => \`\${a.name}: \${a.value}%\`).join(', ')}

As Jules, the AI Strategy Officer for Food Penguin Limited, provide a concise financial insights brief explaining the margin erosion. Suggest 2 operational tweaks to get 'Actual Use' back aligned with 'Plan Structure'. Use bold headings, bullet points, and maintain an executive tone.\`
            }
          ]
        }
      ],
      config: {
        systemInstruction: "You are Jules, the rigorous AI Strategy Officer for 'Food Penguin Limited'. You focus on driving efficiency, reducing waste, and recovering profit margins through data-driven operational tweaks.",
        temperature: 0.3
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error (finance-analysis):", error);
    res.status(500).json({ error: "Failed to generate finance report." });
  }
});
`;

c = c.replace(/app.listen\(/, apiContent + '\napp.listen(');
fs.writeFileSync('server.ts', c);
