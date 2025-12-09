///Backend server for the TrustMed AI prototype.
///This file exposes 3 main endpoints that talk to OpenAI:
///- /v1/intake/concern-analyze
///- /v1/intake/generate-questions
///- /v1/intake/final-report
///The web app calls these APIs during the intake flow.
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

//////server setup////////

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

////OpenAI prompts + helpers////////
////These system prompts define how the LLM should behave for each endpoint///
////They strictly limit the model to structuring language, NOT diagnosing/////


const SYSTEM_PROMPT = `
You are the backend language engine for TrustMed AI, a mobile health education assistant.
Your job is ONLY to help with language-based structuring of patient concerns.

Safety rules:
- DO NOT diagnose any condition.
- DO NOT suggest specific treatments, medications, doses, or home remedies.
- DO NOT give probabilities or certainty about causes.
- DO NOT provide triage decisions (e.g. ER vs. primary care); that is handled in code.
- You may mention GENERAL clinical concepts in neutral terms, but NEVER as a personal diagnosis.
- Your output will never be shown directly to patients without additional safety checks.

Task for this endpoint:
1) Classify the patient's free-text concern into a primary symptom category.
2) Provide 2–4 additional candidate categories if relevant.
3) Rewrite their concern into a concise, professional, clinician-style summary.
4) Identify whether psychosocial factors (stress, mood, social context) are mentioned.
5) Optionally extract duration text and body location words if clearly stated.
6) Provide short general safety notes for developers (not for the patient).

Return ONLY a single JSON object that matches:

interface ConcernAnalyzeResponse {
  sessionId?: string;
  primaryCategory: string;
  candidateCategories: string[];
  clinicalSummary: string;
  psychosocialFactorsMentioned: boolean;
  durationText?: string;
  bodyLocations?: string[];
  safetyNotes: string[];
}

Constraints:
- primaryCategory: short, human-readable label (e.g. "Chest pain").
- candidateCategories: 1–5 short labels, primaryCategory should be first.
- clinicalSummary: 1–4 sentences, neutral and professional.
- safetyNotes: 0–3 brief notes in general terms only.
- Do NOT include any keys not listed in the interface.
- Do NOT wrap the JSON in backticks or extra text.
`;

const QUESTIONS_SYSTEM_PROMPT = `
You are the backend language engine for TrustMed AI, a mobile health education assistant.

Your ONLY task for this endpoint is:
- to generate helpful, neutral questions that a patient can ask a licensed clinician
- based on a short clinical-style summary and symptom category.

Safety rules:
- DO NOT diagnose any condition.
- DO NOT suggest treatments, medications, doses, or home remedies.
- DO NOT tell the patient what will happen or what the doctor will do.
- DO NOT give triage advice (e.g. ER vs urgent care vs home).
- Avoid probabilities, labels like "likely", "unlikely", or references to specific diseases.

You will receive:
- concernType (short label, e.g. "Chest pain"),
- clinicalSummary (1–4 sentences),
- optional durationText and bodyLocations,
- optional psychosocialFactorsMentioned flag.

Your job:
1) Generate 5–8 clear, respectful questions the patient could ask their clinician.
2) Questions should be general, focused on understanding, next steps, and monitoring.
3) Avoid yes/no questions where possible; prefer open-ended phrasing.
4) Tailor the questions to the concernType and clinicalSummary, without adding diagnoses.

Return ONLY a JSON object with this shape:

interface GenerateQuestionsResponse {
  concernType: string;
  questions: string[];
  rationaleNotes: string[];
  safetyNotes: string[];
}

- questions: 5–8 short questions, each a full sentence.
- rationaleNotes: brief dev-facing notes explaining what each question is about (e.g. "clarifies red flags", "asks about testing").
- safetyNotes: 0–3 short notes about potential risks, limitations, or things a developer should keep in mind.

Do NOT include any other keys.
Do NOT wrap the JSON in backticks or any extra commentary.
`;

const FINAL_REPORT_SYSTEM_PROMPT = `
You are the backend language engine for TrustMed AI, a mobile health education assistant.

Your ONLY task for this endpoint is:
- to rewrite an existing risk assessment into clear, empathetic language for the patient,
- WITHOUT changing the risk level, red flags, or core recommendations that were computed by code.

Safety rules:
- DO NOT diagnose any specific condition.
- DO NOT suggest medications, doses, or specific treatments.
- DO NOT change the risk level (Low, Moderate, High).
- DO NOT weaken or remove any red flag ideas implied by the input.
- DO NOT give new triage advice beyond the recommendations provided.
- Keep language educational, gentle, and non-alarming, but honest.

You will receive:
- riskLevel: 'Low' | 'Moderate' | 'High'
- concernType: short label, e.g. "Chest pain"
- symptomSummary: short text summarizing reported symptoms and severities
- redFlags: array of strings (warning messages from code)
- recommendations: array of strings (actions / next steps written by code)

Your job:
1) Write a short "summary" paragraph (1–3 sentences) restating the situation in plain language.
2) Write an "analysis" paragraph (2–4 sentences) explaining in general what this risk level means and what the patient should be mindful of.
3) Provide a cleaned-up list of "recommendations" that is consistent with the given recommendations.
4) Write a clear "disclaimer" stating this is not medical advice or a diagnosis and does not replace a clinician.
5) Optionally add 0–3 "safetyNotes" for developers (not shown directly to patients).
6) Include the phrase "LLM_ACTIVE" in the summary so developers can confirm the LLM was used.

Return ONLY a JSON object:

interface FinalReportResponse {
  riskLevel: 'Low' | 'Moderate' | 'High';
  concernType: string;
  summary: string;
  analysis: string;
  recommendations: string[];
  disclaimer: string;
  safetyNotes: string[];
}

Do NOT include any other keys.
Do NOT wrap the JSON in backticks or extra text.
`;

///Helpers//////
///Helper to build a user-facing prompt for the concern-analyze endpoint///

function buildUserPrompt(payload) {
  return [
    'Free-text concern from patient (verbatim):',
    payload.freeTextConcern.trim(),
    '',
    'Context (may be partial, do not over-interpret):',
    JSON.stringify(
      {
        ageYears: payload.ageYears ?? null,
        sexAtBirth: payload.sexAtBirth ?? null,
        currentPregnancyStatus: payload.currentPregnancyStatus ?? null,
        locale: payload.locale ?? 'en-US',
        sessionId: payload.sessionId ?? null,
      },
      null,
      2
    ),
  ].join('\n');
}

///////validation helpers to keep bad requests from reaching the LLM///////
function validateConcernRequest(body) {
  if (!body || typeof body !== 'object') {
    return 'Body must be a JSON object.';
  }
  if (typeof body.freeTextConcern !== 'string' || body.freeTextConcern.trim().length < 10) {
    return 'freeTextConcern is required and must be at least 10 characters.';
  }
  return null;
}

function validateGenerateQuestionsRequest(body) {
  if (!body || typeof body !== 'object') return 'Body must be an object.';
  if (typeof body.concernType !== 'string' || !body.concernType.trim()) {
    return 'concernType is required and must be a non-empty string.';
  }
  if (typeof body.clinicalSummary !== 'string' || !body.clinicalSummary.trim()) {
    return 'clinicalSummary is required and must be a non-empty string.';
  }
  return null;
}

function validateFinalReportRequest(body) {
  if (!body || typeof body !== 'object') return 'Body must be an object.';
  if (!['Low', 'Moderate', 'High'].includes(body.riskLevel)) {
    return 'riskLevel must be Low, Moderate, or High.';
  }
  if (typeof body.concernType !== 'string' || !body.concernType.trim()) {
    return 'concernType is required.';
  }
  if (typeof body.symptomSummary !== 'string' || !body.symptomSummary.trim()) {
    return 'symptomSummary is required.';
  }
  if (!Array.isArray(body.redFlags) || !Array.isArray(body.recommendations)) {
    return 'redFlags and recommendations must be arrays.';
  }
  return null;
}

////////Log API key presence////////////
////////Quick sanity check so I know the .env is loaded correctly////
console.log('API key loaded:', !!process.env.OPENAI_API_KEY);

////////Route: POST /v1/intake/concern-analyze////////////
////////Step 1 backend: takes free-text concern and returns categories + clinical summary////////

app.post('/v1/intake/concern-analyze', async (req, res) => {
  const error = validateConcernRequest(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const payload = {
    sessionId: req.body.sessionId ?? null,
    locale: req.body.locale ?? 'en-US',
    freeTextConcern: req.body.freeTextConcern,
    ageYears: req.body.ageYears ?? null,
    sexAtBirth: req.body.sexAtBirth ?? null,
    currentPregnancyStatus: req.body.currentPregnancyStatus ?? null,
  };

  try {
    const userPrompt = buildUserPrompt(payload);

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const text = await openaiResponse.text();
      console.error('OpenAI error (concern-analyze)', openaiResponse.status, text);
      return res.status(502).json({ error: 'LLM request failed.' });
    }

    const data = await openaiResponse.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('OpenAI returned no content (concern-analyze)', data);
      return res.status(502).json({ error: 'LLM returned no content.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse LLM JSON (concern-analyze)', content);
      return res.status(502).json({ error: 'LLM returned invalid JSON.' });
    }

    if (!Array.isArray(parsed.candidateCategories)) {
      parsed.candidateCategories = parsed.primaryCategory ? [parsed.primaryCategory] : [];
    }
    if (!Array.isArray(parsed.safetyNotes)) {
      parsed.safetyNotes = [];
    }
    if (!parsed.sessionId && payload.sessionId) {
      parsed.sessionId = payload.sessionId;
    }

    return res.json(parsed);
  } catch (err) {
    console.error('Unhandled server error (concern-analyze)', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

////////Route: POST /v1/intake/generate-questions//////////////
////////Step 4 backend: given a concern + summary, generate questions for the clinician////


app.post('/v1/intake/generate-questions', async (req, res) => {
  const error = validateGenerateQuestionsRequest(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const payload = {
    concernType: req.body.concernType,
    clinicalSummary: req.body.clinicalSummary,
    durationText: req.body.durationText ?? null,
    bodyLocations: Array.isArray(req.body.bodyLocations) ? req.body.bodyLocations : [],
    psychosocialFactorsMentioned: !!req.body.psychosocialFactorsMentioned,
  };

  const userPrompt = [
    'Concern and summary from TrustMed AI:',
    JSON.stringify(payload, null, 2),
  ].join('\n');

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: QUESTIONS_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const text = await openaiResponse.text();
      console.error('OpenAI error (generate-questions)', openaiResponse.status, text);
      return res.status(502).json({ error: 'LLM request failed.' });
    }

    const data = await openaiResponse.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('OpenAI returned no content (generate-questions)', data);
      return res.status(502).json({ error: 'LLM returned no content.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse LLM JSON (generate-questions)', content);
      return res.status(502).json({ error: 'LLM returned invalid JSON.' });
    }

    if (!Array.isArray(parsed.questions)) parsed.questions = [];
    if (!Array.isArray(parsed.rationaleNotes)) parsed.rationaleNotes = [];
    if (!Array.isArray(parsed.safetyNotes)) parsed.safetyNotes = [];
    parsed.concernType = payload.concernType;

    return res.json(parsed);
  } catch (err) {
    console.error('Unhandled server error (generate-questions)', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

//////////Route: POST /v1/intake/final-report////////
//////////Step 5 backend: rewrite the risk assessment into patient-facing text////////

app.post('/v1/intake/final-report', async (req, res) => {
  const error = validateFinalReportRequest(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const payload = {
    riskLevel: req.body.riskLevel,
    concernType: req.body.concernType,
    symptomSummary: req.body.symptomSummary,
    redFlags: req.body.redFlags || [],
    recommendations: req.body.recommendations || [],
  };

  const userPrompt = [
    'Risk assessment from TrustMed AI (computed by deterministic code):',
    JSON.stringify(payload, null, 2),
  ].join('\n');

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: FINAL_REPORT_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const text = await openaiResponse.text();
      console.error('OpenAI error (final-report)', openaiResponse.status, text);
      return res.status(502).json({ error: 'LLM request failed.' });
    }

    const data = await openaiResponse.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('OpenAI returned no content (final-report)', data);
      return res.status(502).json({ error: 'LLM returned no content.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse LLM JSON (final-report)', content);
      return res.status(502).json({ error: 'LLM returned invalid JSON.' });
    }

    if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];
    if (!Array.isArray(parsed.safetyNotes)) parsed.safetyNotes = [];

    parsed.riskLevel = payload.riskLevel;
    parsed.concernType = payload.concernType;

    return res.json(parsed);
  } catch (err) {
    console.error('Unhandled server error (final-report)', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/////////Start server/////////
/////////Start the Express server so the web app can call these endpoints/////////

app.listen(PORT, () => {
  console.log(`TrustMed AI backend running on http://localhost:${PORT}`);
});
