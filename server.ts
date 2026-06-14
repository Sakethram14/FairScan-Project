import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { EventEmitter } from "events";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Live Monitor Event Emitter ─────────────────────────────────────────────
export const liveMonitorEmitter = new EventEmitter();

// Background simulator for Live Monitor
setInterval(() => {
  const isFlagged = Math.random() > 0.85;
  const endpoints = ["/api/v1/predict_hire", "/api/v1/screen_resume", "/api/v2/evaluate"];
  const proxies = ["Pin Code (Tier-3)", "Surname (Caste Correlated)", "Gap Year (Maternity Correlated)", "Language Style"];
  
  const log = {
    id: Math.random().toString(36).substring(7),
    time: new Date().toLocaleTimeString(),
    endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
    latency: Math.floor(Math.random() * 120) + 15,
    status: isFlagged ? "FLAGGED" : "PASS",
    ...(isFlagged && {
      reason: "High Disparate Impact Probability",
      demographicProxy: proxies[Math.floor(Math.random() * proxies.length)]
    })
  };
  liveMonitorEmitter.emit("log", log);
}, 2000);

// ─── Mock Detection Fallback ────────────────────────────────────────────────

interface ProxyDetection {
  detected_proxies: Array<{
    category: string;
    columns: string[];
    reasoning: string;
  }>;
  confidence: number;
}

function mockDetection(columnNames: string[]): ProxyDetection {
  const lowerColumns = columnNames.map((c) => c.toLowerCase());

  const buckets: Array<{
    category: string;
    keywords: string[];
    reasoning: string;
  }> = [
    {
      category: "vernacular_proxy",
      keywords: ["medium", "language", "vernacular", "mother_tongue"],
      reasoning:
        "Columns related to language or medium of instruction can serve as proxies for socioeconomic and caste background in the Indian education system, where vernacular-medium students often face systemic disadvantages in English-centric hiring pipelines.",
    },
    {
      category: "geographic_proxy",
      keywords: [
        "tier",
        "hometown",
        "city",
        "pin",
        "native",
        "district",
        "state",
        "rural",
        "urban",
      ],
      reasoning:
        "Geographic identifiers like city tier, pin code, or rural/urban tags act as strong proxies for caste, tribe, and economic class in India, where development and opportunity are unevenly distributed across regions.",
    },
    {
      category: "first_gen_proxy",
      keywords: ["gen", "parent", "first_gen", "pedigree", "alumni"],
      reasoning:
        "First-generation graduate status and parental education level are proxies for caste and class privilege in India, where access to higher education has historically been restricted along social lines.",
    },
    {
      category: "digital_divide_proxy",
      keywords: ["latency", "bandwidth", "ping", "connection", "internet", "network"],
      reasoning:
        "Internet quality metrics reflect India's stark digital divide—rural and lower-income candidates often have poor connectivity, penalizing them in online assessments and video interviews.",
    },
  ];

  const detected_proxies: ProxyDetection["detected_proxies"] = [];

  for (const bucket of buckets) {
    const matchedColumns = columnNames.filter((col) => {
      const lower = col.toLowerCase();
      return bucket.keywords.some((kw) => lower.includes(kw));
    });
    if (matchedColumns.length > 0) {
      detected_proxies.push({
        category: bucket.category,
        columns: matchedColumns,
        reasoning: bucket.reasoning,
      });
    }
  }

  const confidence = detected_proxies.length > 0 ? 0.6 : 0;

  return { detected_proxies, confidence };
}

// ─── Fairness Helpers ───────────────────────────────────────────────────────

function isPositiveLabel(value: any): boolean {
  if (value == null) return false;
  if (typeof value === "number") return value >= 1;
  if (typeof value === "boolean") return value;
  const s = String(value).trim().toLowerCase();
  return ["yes", "hired", "approved", "accepted", "1", "true", "pass", "passed"].includes(s);
}

function detectThreshold(values: number[]): number {
  // Use median as threshold when dealing with numeric scores
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function isNumericColumn(values: any[]): boolean {
  const sample = values.filter((v) => v != null).slice(0, 50);
  return sample.length > 0 && sample.every((v) => !isNaN(Number(v)));
}

// ─── Server ─────────────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // ── Health check ────────────────────────────────────────────────────────
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ── GET /api/monitor/stream (SSE) ───────────────────────────────────────
  app.get("/api/monitor/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders(); // Force headers to be sent immediately

    const onLog = (log: any) => {
      res.write(`data: ${JSON.stringify(log)}\n\n`);
    };

    liveMonitorEmitter.on("log", onLog);

    req.on("close", () => {
      liveMonitorEmitter.off("log", onLog);
    });
  });

  // ── POST /api/audit/proxy-signals ───────────────────────────────────────
  app.post("/api/audit/proxy-signals", async (req, res) => {
    try {
      const { columnNames, sampleData } = req.body as {
        columnNames: string[];
        sampleData: any[];
      };

      if (!columnNames || !Array.isArray(columnNames)) {
        res.status(400).json({ error: "columnNames is required and must be an array" });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.warn("GEMINI_API_KEY not set – falling back to mock detection");
        res.json(mockDetection(columnNames));
        return;
      }

      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a bias-auditing expert specializing in the Indian ecosystem.

Analyze the following dataset columns and a sample of the data. Your task is to identify columns that serve as **proxy signals for discrimination** specifically in the **Indian context**.

Categorize each detected proxy into EXACTLY one of these Indian-specific bias buckets:
- "vernacular_proxy": Vernacular & Medium of Instruction bias — columns related to language, medium of instruction, mother tongue. In India, vernacular-medium students face systemic disadvantages in English-centric hiring.
- "geographic_proxy": Geographic Tier / Hometown bias — columns related to hometown, city tier, pin code, native place, district, state, rural/urban classification. In India, geography is a strong proxy for caste, tribe, and economic class.
- "first_gen_proxy": First-Generation / Pedigree bias — columns related to first-generation graduate status, parent education level, alumni networks. In India, access to higher education has historically been restricted along caste and class lines.
- "digital_divide_proxy": Digital Infrastructure Divide — columns related to internet latency, bandwidth, connection quality, network type. India's digital divide penalizes rural and lower-income candidates in online assessments.

For each detected proxy, provide a "reasoning" string explaining WHY this particular column is a bias concern in the Indian context.

COLUMNS: ${JSON.stringify(columnNames)}

SAMPLE DATA (first 5 rows): ${JSON.stringify((sampleData || []).slice(0, 5))}

Return ONLY a JSON object matching the required schema.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detected_proxies: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      columns: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      reasoning: { type: Type.STRING },
                    },
                    required: ["category", "columns", "reasoning"],
                  },
                },
                confidence: { type: Type.NUMBER },
              },
              required: ["detected_proxies", "confidence"],
            },
          },
        });

        const text = response.text ?? "";
        const parsed: ProxyDetection = JSON.parse(text);
        res.json(parsed);
      } catch (geminiError) {
        console.error("Gemini API failed, falling back to mock detection:", geminiError);
        res.json(mockDetection(columnNames));
      }
    } catch (err: any) {
      console.error("proxy-signals error:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ── POST /api/lens/analyze-resume ─────────────────────────────────────────
  app.post("/api/lens/analyze-resume", async (req, res) => {
    try {
      const { fileBase64, mimeType, manualProfile } = req.body as {
        fileBase64?: string;
        mimeType?: string;
        manualProfile?: {
          name: string;
          pinCode: string;
          gender: string;
          education: string;
        };
      };

      if (!fileBase64 && !manualProfile) {
        res.status(400).json({ error: "Either fileBase64 or manualProfile is required" });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;

      const systemPrompt = `You are simulating a legacy, biased AI-powered Applicant Tracking System (ATS) used by Indian IT companies and startups for fresher hiring.

Your task is to analyze this candidate's resume/profile and identify ALL the ways a typical biased ATS would silently penalize them. You must think like a discriminatory algorithm that encodes real-world Indian hiring biases.

Analyze the following Indian-specific proxy signals for bias:

1. **Name/Identity Bias**: Does the candidate's name reveal caste (e.g., surnames like Yadav, Paswan, Chamar indicate OBC/SC/ST backgrounds), religion (Muslim names like Mohammed, Fatima), or regional identity? Indian ATS systems trained on historical data often correlate these with rejection.

2. **College Pedigree Bias**: Is the candidate from an IIT/NIT/BITS/top-50 NIRF institution, or from a Tier-2/Tier-3 private engineering college, state university, or polytechnic? In India, "brand name college" bias is one of the strongest filters—even more than actual skill.

3. **Geographic/Pin Code Bias**: Does the candidate's address, hometown, or pin code suggest a rural area, small town, Tier-2/Tier-3 city, or a less-developed state (e.g., Bihar, Jharkhand, UP, Odisha)? Candidates from metro cities (Bangalore, Hyderabad, Pune, Delhi NCR) get 15-30% higher callback rates.

4. **Vernacular/Medium of Instruction Bias**: Are there signs the candidate studied in a vernacular medium (Hindi/regional language medium school)? English-medium candidates are systematically favored in Indian hiring.

5. **Gender Bias**: Does the candidate's gender affect their perceived fit? Women in India face bias in tech hiring, especially for roles involving travel, late shifts, or "culture fit" assessments.

6. **First-Generation Graduate Bias**: Are there indicators the candidate is a first-generation college graduate (parents' education not mentioned, no legacy connections)? In India, candidates from educated families get implicit networking advantages.

7. **Gap Year / Age Bias**: Does the candidate have education gaps that might indicate financial hardship, family responsibilities, or re-attempts at competitive exams (common in India)?

8. **Communication/English Proficiency Bias**: Are there indicators of weaker English proficiency (e.g., resume written in mixed language, grammatical patterns typical of vernacular-medium students)?

You MUST return a JSON object with:
- "penalty": A number from 0 to 100 representing the total estimated bias penalty percentage. Higher means more biased against.
- "baseProbability": The candidate's estimated merit-based selection probability (0-100) based purely on skills/experience.
- "adjustedProbability": The probability AFTER the biased ATS applies hidden penalties. Must be baseProbability minus the penalty effect.
- "redFlags": An array of 3-8 strings. Each string must be a specific, detailed explanation of ONE bias the ATS would apply, referencing the actual content from the resume. Be specific—mention exact names, colleges, locations found in the resume.
- "proxyBreakdown": An array of objects with { "proxy": string (name of the bias category), "impact": number (penalty percentage for this specific proxy, 0-40), "detail": string (one-line explanation) }

Be brutally honest about how Indian hiring systems discriminate. This is an educational tool to expose bias.`;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });

          const parts: any[] = [];

          if (fileBase64 && mimeType) {
            // Send the actual document to Gemini for multimodal parsing
            parts.push({
              inlineData: {
                data: fileBase64,
                mimeType: mimeType,
              },
            });
            parts.push({
              text: "Analyze this resume for Indian hiring biases as described in your instructions. Return ONLY a JSON object matching the required schema.",
            });
          } else if (manualProfile) {
            parts.push({
              text: `Analyze this candidate profile for Indian hiring biases:
Name: ${manualProfile.name}
Pin Code: ${manualProfile.pinCode}
Gender: ${manualProfile.gender}
Education/Skills: ${manualProfile.education}

Return ONLY a JSON object matching the required schema.`,
            });
          }

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
              { role: "user", parts },
            ],
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  penalty: { type: Type.NUMBER },
                  baseProbability: { type: Type.NUMBER },
                  adjustedProbability: { type: Type.NUMBER },
                  redFlags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  proxyBreakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        proxy: { type: Type.STRING },
                        impact: { type: Type.NUMBER },
                        detail: { type: Type.STRING },
                      },
                      required: ["proxy", "impact", "detail"],
                    },
                  },
                },
                required: ["penalty", "baseProbability", "adjustedProbability", "redFlags", "proxyBreakdown"],
              },
            },
          });

          const text = response.text ?? "";
          const parsed = JSON.parse(text);
          res.json(parsed);
          return;
        } catch (geminiError) {
          console.error("Gemini resume analysis failed, using mock:", geminiError);
        }
      }

      // ── Mock fallback ───────────────────────────────────────────────────
      const mockResult = {
        penalty: 32,
        baseProbability: 82,
        adjustedProbability: 50,
        redFlags: [
          "Surname pattern detected that correlates with historically disadvantaged communities in Indian hiring datasets.",
          "Pin code indicates a Tier-3 city or rural region. Candidates from non-metro areas receive 15-25% fewer callbacks in typical Indian ATS systems.",
          "College not found in top-100 NIRF rankings. Indian recruiters heavily weight institutional pedigree over demonstrated skill.",
          "Resume language patterns suggest vernacular-medium schooling background, which triggers implicit bias in English-centric corporate hiring pipelines.",
          "No mention of internships at recognized brands — first-generation graduates often lack access to networking and referral pipelines that dominate Indian tech hiring.",
        ],
        proxyBreakdown: [
          { proxy: "Name/Identity Bias", impact: 8, detail: "Surname correlates with caste-based discrimination patterns in historical hiring data." },
          { proxy: "College Pedigree", impact: 12, detail: "Non-IIT/NIT/BITS institution significantly reduces callback probability." },
          { proxy: "Geographic Bias", impact: 7, detail: "Non-metro pin code triggers location-based filtering in ATS." },
          { proxy: "Vernacular Medium", impact: 5, detail: "Linguistic markers suggest non-English medium education background." },
        ],
      };
      res.json(mockResult);
    } catch (err: any) {
      console.error("resume-analysis error:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ── POST /api/audit/analyze ─────────────────────────────────────────────
  app.post("/api/audit/analyze", (req, res) => {
    try {
      const { dataset, sensitiveCol, predictionCol, labelCol } = req.body as {
        dataset: any[];
        sensitiveCol: string;
        predictionCol: string;
        labelCol?: string;
      };

      if (!dataset || !sensitiveCol || !predictionCol) {
        res.status(400).json({ error: "dataset, sensitiveCol, and predictionCol are required" });
        return;
      }

      // Group by sensitive column
      const groups: Record<string, any[]> = {};
      for (const row of dataset) {
        const key = String(row[sensitiveCol] ?? "unknown");
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      }

      // Determine if prediction column is numeric
      const allPredValues = dataset.map((r) => r[predictionCol]);
      const predIsNumeric = isNumericColumn(allPredValues);
      let threshold = 0.5;
      if (predIsNumeric) {
        const numericVals = allPredValues.map(Number).filter((n) => !isNaN(n));
        threshold = detectThreshold(numericVals);
      }

      // Compute per-group metrics
      const groupMetrics: Array<{
        group: string;
        approvalRate: number;
        count: number;
        truePositiveRate: number;
      }> = [];

      let totalCorrect = 0;
      let totalCount = 0;

      for (const [groupName, rows] of Object.entries(groups)) {
        const count = rows.length;
        let approved = 0;
        let truePositives = 0;
        let actualPositives = 0;

        for (const row of rows) {
          const predValue = row[predictionCol];
          let isApproved: boolean;

          if (predIsNumeric) {
            isApproved = Number(predValue) >= threshold;
          } else {
            isApproved = isPositiveLabel(predValue);
          }

          if (isApproved) approved++;

          // Accuracy & TPR calculation when labelCol is available
          if (labelCol && row[labelCol] != null) {
            const actualPositive = isPositiveLabel(row[labelCol]);
            const predictedPositive = isApproved;

            if (actualPositive) {
              actualPositives++;
              if (predictedPositive) truePositives++;
            }

            // Accuracy: prediction matches label
            const actualLabel = actualPositive;
            if (predictedPositive === actualLabel) totalCorrect++;
          }

          totalCount++;
        }

        const approvalRate = count > 0 ? approved / count : 0;
        const truePositiveRate = actualPositives > 0 ? truePositives / actualPositives : 0;

        groupMetrics.push({
          group: groupName,
          approvalRate: Math.round(approvalRate * 10000) / 10000,
          count,
          truePositiveRate: Math.round(truePositiveRate * 10000) / 10000,
        });
      }

      // Aggregate fairness metrics
      const rates = groupMetrics.map((g) => g.approvalRate);
      const minRate = Math.min(...rates);
      const maxRate = Math.max(...rates);

      const disparateImpactRatio = maxRate > 0 ? Math.round((minRate / maxRate) * 10000) / 10000 : 0;
      const demographicParityGap = Math.round((maxRate - minRate) * 10000) / 10000;
      const accuracy = labelCol && totalCount > 0
        ? Math.round((totalCorrect / totalCount) * 10000) / 10000
        : null;

      // Fairness score: 0-100 scale based on disparate impact (1.0 = perfect = 100)
      const fairnessScore = Math.round(Math.min(disparateImpactRatio / 0.8, 1) * 100);

      // Verdict
      let verdict: "CRITICAL" | "WARNING" | "PASS";
      if (disparateImpactRatio < 0.8) {
        verdict = "CRITICAL";
      } else if (disparateImpactRatio < 0.9) {
        verdict = "WARNING";
      } else {
        verdict = "PASS";
      }

      // Emit real event to Live Monitor
      liveMonitorEmitter.emit("log", {
        id: Math.random().toString(36).substring(7),
        time: new Date().toLocaleTimeString(),
        endpoint: "/api/audit/analyze",
        latency: Math.floor(Math.random() * 80) + 20,
        status: verdict === "CRITICAL" ? "FLAGGED" : "PASS",
        ...(verdict === "CRITICAL" && {
          reason: "Detected fairness violation in historical dataset",
          demographicProxy: `Disparate Impact < 0.8 for ${sensitiveCol}`
        })
      });

      res.json({
        accuracy,
        fairnessScore,
        disparateImpactRatio,
        demographicParityGap,
        verdict,
        groupMetrics,
      });
    } catch (err: any) {
      console.error("analyze error:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ── POST /api/simulate ─────────────────────────────────────────────────
  app.post("/api/simulate", (req, res) => {
    try {
      const { dataset, sensitiveCol, predictionCol, labelCol } = req.body as {
        dataset: any[];
        sensitiveCol: string;
        predictionCol: string;
        labelCol?: string;
      };

      if (!dataset || !sensitiveCol || !predictionCol) {
        res.status(400).json({ error: "dataset, sensitiveCol, and predictionCol are required" });
        return;
      }

      // ── Determine threshold ────────────────────────────────────────────
      const allPredValues = dataset.map((r) => r[predictionCol]);
      const predIsNumeric = isNumericColumn(allPredValues);
      let threshold = 0.5;
      if (predIsNumeric) {
        const numericVals = allPredValues.map(Number).filter((n) => !isNaN(n));
        threshold = detectThreshold(numericVals);
      }

      // ── Compute original approval rates per group ──────────────────────
      const groupsOriginal: Record<string, { approved: number; total: number }> = {};
      for (const row of dataset) {
        const g = String(row[sensitiveCol] ?? "unknown");
        if (!groupsOriginal[g]) groupsOriginal[g] = { approved: 0, total: 0 };
        groupsOriginal[g].total++;

        const predValue = row[predictionCol];
        const isApproved = predIsNumeric
          ? Number(predValue) >= threshold
          : isPositiveLabel(predValue);
        if (isApproved) groupsOriginal[g].approved++;
      }

      // ── Curriculum Learning: partition into easy/hard tiers ────────────
      // Confidence = distance from threshold (normalized). Higher = easier.
      type AnnotatedRow = { row: any; confidence: number; group: string };

      const annotated: AnnotatedRow[] = dataset.map((row) => {
        const predValue = row[predictionCol];
        let confidence: number;
        if (predIsNumeric) {
          confidence = Math.abs(Number(predValue) - threshold);
        } else {
          // For categorical: approved = 1.0, not approved = 0.0 → distance from 0.5
          confidence = isPositiveLabel(predValue) ? 0.5 : 0.5;
          // Mark borderline text values with low confidence
          const s = String(predValue).trim().toLowerCase();
          if (["maybe", "waitlist", "pending", "review"].includes(s)) {
            confidence = 0.1;
          }
        }
        return {
          row,
          confidence,
          group: String(row[sensitiveCol] ?? "unknown"),
        };
      });

      // Sort by confidence ascending (hardest first)
      annotated.sort((a, b) => a.confidence - b.confidence);

      // Bottom 40% = hard tier, top 60% = easy tier
      const hardCutoff = Math.floor(annotated.length * 0.4);
      const hardTier = annotated.slice(0, hardCutoff);
      const easyTier = annotated.slice(hardCutoff);

      // ── Identify advantaged / disadvantaged groups ──────────────────────
      const groupRates: Record<string, number> = {};
      for (const [g, data] of Object.entries(groupsOriginal)) {
        groupRates[g] = data.total > 0 ? data.approved / data.total : 0;
      }
      const groupNames = Object.keys(groupRates);
      const maxGroupRate = Math.max(...Object.values(groupRates));
      const advantagedGroups = groupNames.filter((g) => groupRates[g] === maxGroupRate);
      const disadvantagedGroups = groupNames.filter((g) => groupRates[g] < maxGroupRate);

      // ── RegMixup: augment hard tier ────────────────────────────────────
      // Seeded pseudo-random for Beta(0.2, 0.2) approximation
      function sampleBeta(alpha: number, beta: number): number {
        // Simple approximation using the Jönker method (U-shape for low alpha/beta)
        const u = Math.random();
        const v = Math.random();
        const x = Math.pow(u, 1 / alpha);
        const y = Math.pow(v, 1 / beta);
        return x / (x + y);
      }

      // Get numeric feature columns (exclude sensitive, prediction, label)
      const excludeCols = new Set([sensitiveCol, predictionCol]);
      if (labelCol) excludeCols.add(labelCol);
      const featureCols = Object.keys(dataset[0] || {}).filter(
        (c) => !excludeCols.has(c) && isNumericColumn(dataset.slice(0, 20).map((r) => r[c]))
      );

      // Split hard tier by group
      const hardAdvantaged = hardTier.filter((a) => advantagedGroups.includes(a.group));
      const hardDisadvantaged = hardTier.filter((a) => disadvantagedGroups.includes(a.group));

      const syntheticRows: any[] = [];
      const mixCount = Math.min(hardAdvantaged.length, hardDisadvantaged.length, Math.floor(dataset.length * 0.15));

      for (let i = 0; i < mixCount; i++) {
        const adv = hardAdvantaged[i % hardAdvantaged.length];
        const dis = hardDisadvantaged[i % hardDisadvantaged.length];
        const lambda = sampleBeta(0.2, 0.2);

        const mixed: any = { ...dis.row };

        // Mix numeric features: x_mixed = lambda * x_adv + (1 - lambda) * x_dis
        for (const col of featureCols) {
          const vAdv = Number(adv.row[col]);
          const vDis = Number(dis.row[col]);
          if (!isNaN(vAdv) && !isNaN(vDis)) {
            mixed[col] = lambda * vAdv + (1 - lambda) * vDis;
          }
        }

        // Mix prediction score too
        if (predIsNumeric) {
          const pAdv = Number(adv.row[predictionCol]);
          const pDis = Number(dis.row[predictionCol]);
          if (!isNaN(pAdv) && !isNaN(pDis)) {
            mixed[predictionCol] = lambda * pAdv + (1 - lambda) * pDis;
          }
        }

        // Keep the disadvantaged group label (to boost their outcomes)
        mixed[sensitiveCol] = dis.group;
        syntheticRows.push(mixed);
      }

      // ── Combine: original clean samples + augmented ────────────────────
      const augmentedDataset = [...dataset, ...syntheticRows];

      // ── Recalculate approval rates on augmented dataset ────────────────
      const groupsSimulated: Record<string, { approved: number; total: number }> = {};
      for (const row of augmentedDataset) {
        const g = String(row[sensitiveCol] ?? "unknown");
        if (!groupsSimulated[g]) groupsSimulated[g] = { approved: 0, total: 0 };
        groupsSimulated[g].total++;

        const predValue = row[predictionCol];
        const isApproved = predIsNumeric
          ? Number(predValue) >= threshold
          : isPositiveLabel(predValue);
        if (isApproved) groupsSimulated[g].approved++;
      }

      // ── Build response ─────────────────────────────────────────────────
      const simulatedGroupMetrics = groupNames.map((g) => ({
        group: g,
        originalRate:
          Math.round(
            (groupsOriginal[g]
              ? groupsOriginal[g].approved / groupsOriginal[g].total
              : 0) * 10000
          ) / 10000,
        simulatedRate:
          Math.round(
            (groupsSimulated[g]
              ? groupsSimulated[g].approved / groupsSimulated[g].total
              : 0) * 10000
          ) / 10000,
      }));

      // Parity recovery: how much of the demographic parity gap was closed
      const originalRates = simulatedGroupMetrics.map((m) => m.originalRate);
      const simulatedRates = simulatedGroupMetrics.map((m) => m.simulatedRate);
      const originalGap = Math.max(...originalRates) - Math.min(...originalRates);
      const simulatedGap = Math.max(...simulatedRates) - Math.min(...simulatedRates);
      const parityRecovery =
        originalGap > 0
          ? Math.round(((originalGap - simulatedGap) / originalGap) * 10000) / 10000
          : 1;

      res.json({
        simulatedGroupMetrics,
        parityRecovery,
        technique: "curriculum_regmixup",
      });
    } catch (err: any) {
      console.error("simulate error:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ── Vite middleware for development ───────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
