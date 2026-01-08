const express = require("express");
const multer = require("multer");
const fs = require("fs");
const mammoth = require("mammoth");
const skillMap = require("./skills.js");
const cors = require("cors");

// --- FAIL-SAFE PDF-PARSE IMPORT ---
// This handles the "TypeError: pdfParse is not a function" error
let pdfParse = require("pdf-parse");
if (typeof pdfParse !== "function" && pdfParse.default) {
  pdfParse = pdfParse.default;
}

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

/* --------------------
   TEXT CLEANING
-------------------- */
function cleanText(text) {
  return text
    .toLowerCase()
    // Keeps alphanumeric and symbols used in programming like C++, C#, .NET
    .replace(/[^a-z0-9+.#\s]/g, " ") 
    .replace(/\s+/g, " ")
    .trim();
}

/* --------------------
   SKILL EXTRACTION LOGIC
-------------------- */
function extractAllSkills(rawText) {
    const found = [];
    const cleanedText = cleanText(rawText);
  
    for (const category in skillMap) {
      for (const skill of skillMap[category]) {
        // Escape special characters (like C++) and use word boundaries
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // \b ensures we match "Java" but not the "Java" inside "JavaScript"
        // However, for skills like C++, boundaries work differently, so we use a flexible regex
        const regex = new RegExp(`(?:^|\\s)${escapedSkill}(?:\\s|$)`, 'i');
  
        if (regex.test(cleanedText)) {
          found.push({ 
            skill: skill, 
            category: category 
          });
        }
      }
    }
  
    return Array.from(new Set(found.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));
  }

/* --------------------
   RESUME PARSE ROUTE
-------------------- */
app.post("/parse-resume", upload.single("resume"), async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    filePath = req.file.path;
    const fileType = req.file.mimetype;
    let rawText = "";

    // 1. Extract Raw Text based on file type
    if (fileType.includes("pdf")) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      rawText = data.text;
    } 
    else if (fileType.includes("word") || fileType.includes("officedocument")) {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value;
    } 
    else {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported file type. Please upload PDF or DOCX." });
    }

    // 2. Extract skills from the entire text (Experience + Skills sections)
    const allSkills = extractAllSkills(rawText);

    // 3. Cleanup: Delete the file from the server for privacy
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // 4. Return the organized skill set
    // ... (rest of index.js remains the same as provided before)

// Update the return object slightly for easier frontend mapping
return res.json({
    success: true,
    filename: req.file.originalname,
    skills: allSkills, // Array of { skill: 'react', category: 'frontend' }
    // Provide a summary for the chart
    domainSummary: Object.keys(skillMap).map(cat => ({
      name: cat,
      count: allSkills.filter(s => s.category === cat).length
    }))
  });

  } catch (error) {
    console.error("RESUME PARSER ERROR:", error);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: "Parsing failed", details: error.message });
  }
});

/* --------------------
   SERVER START
-------------------- */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Resume Skill Parser running on port ${PORT}`);
  console.log(`🔒 Data Privacy: Files are processed locally and deleted immediately.`);
});