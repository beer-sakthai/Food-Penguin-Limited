const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

const reportAPI = `

// --- Energy/Sustainability Report API ---
app.post("/api/gemini/sustainability-report", async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: "Gemini client not initialized" });
  }

  const { data, totalEnergy, totalVolume, avgWhPerUnit } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: \`Analyze the following oven energy usage vs production volume data for this shift:
Total Energy: \${totalEnergy} kWh
Total Volume: \${totalVolume} units
Average Energy per Unit: \${avgWhPerUnit} Wh

Data points (Hour - Energy - Volume - Wh/Unit):
\${data.map(d => \`\${d.time}: \${d.energy}kWh for \${d.volume} units (\${d.efficiency} Wh/unit)\`).join('\\n')}

Please act as Jules, the Chief AI Strategy Officer for 'Food Penguin Limited'. Provide a highly concise, executive-level ESG and sustainability overview. Propose immediate, actionable operational tweaks to lower energy consumption during low-production hours, ensure minimum energy waste, and maintain our premium green standards. Limit to 3 bullet points. Formatting: bold headers, very crisp.\`
            }
          ]
        }
      ],
      config: {
        systemInstruction: "You are Jules, the Chief AI Strategy Officer for 'Food Penguin Limited', an elite cold-chain and premium ocean-to-table food corporation. You provide sharp, concise, actionable ESG insights for floor managers.",
        temperature: 0.3
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error (sustainability-report):", error);
    res.status(500).json({ error: "Failed to generate sustainability report." });
  }
});
`;

c = c.replace(/app.listen\(/, reportAPI + '\napp.listen(');
fs.writeFileSync('server.ts', c);
