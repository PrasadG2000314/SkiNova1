import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDFMQQrWHnHCvbVDxIDW6gf89-irwOZotU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

interface PredictionRequest {
  dateOfBirth: string;
  birthTime: string;
  birthVenue: string;
}

interface PredictionResponse {
  health: string;
  wealth: string;
  relationships: string;
  career: string;
  personalGrowth: string;
  recommendations: string[];
  fullPrediction: string;
}

function parsePredictionText(text: string): PredictionResponse {
  // Initialize default values
  let health = '';
  let wealth = '';
  let relationships = '';
  let career = '';
  let personalGrowth = '';
  let recommendations: string[] = [];
  let fullPrediction = '';

  // Parse HEALTH section
  const healthMatch = text.match(/HEALTH:\s*([\s\S]*?)(?=WEALTH:|$)/i);
  if (healthMatch) {
    health = healthMatch[1].trim();
  }

  // Parse WEALTH section
  const wealthMatch = text.match(/WEALTH:\s*([\s\S]*?)(?=RELATIONSHIPS:|$)/i);
  if (wealthMatch) {
    wealth = wealthMatch[1].trim();
  }

  // Parse RELATIONSHIPS section
  const relationshipsMatch = text.match(/RELATIONSHIPS:\s*([\s\S]*?)(?=CAREER:|$)/i);
  if (relationshipsMatch) {
    relationships = relationshipsMatch[1].trim();
  }

  // Parse CAREER section
  const careerMatch = text.match(/CAREER[^:]*:\s*([\s\S]*?)(?=GROWTH:|$)/i);
  if (careerMatch) {
    career = careerMatch[1].trim();
  }

  // Parse GROWTH section
  const growthMatch = text.match(/GROWTH:\s*([\s\S]*?)(?=RECOMMENDATIONS:|$)/i);
  if (growthMatch) {
    personalGrowth = growthMatch[1].trim();
  }

  // Parse RECOMMENDATIONS section
  const recommendationsMatch = text.match(/RECOMMENDATIONS:\s*([\s\S]*?)(?=FULL_PREDICTION:|$)/i);
  if (recommendationsMatch) {
    const recText = recommendationsMatch[1];
    recommendations = recText
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.trim().substring(1).trim())
      .filter((line) => line.length > 0);
  }

  // Parse FULL_PREDICTION section
  const fullMatch = text.match(/FULL_PREDICTION:\s*([\s\S]*?)$/i);
  if (fullMatch) {
    fullPrediction = fullMatch[1].trim();
  }

  // Fallback if parsing fails - use entire text as full prediction
  if (!fullPrediction && text) {
    fullPrediction = text;
  }

  // Ensure we have at least some content
  if (!health) health = 'Based on your birth chart, you can expect positive health developments.';
  if (!wealth) wealth = 'Financial prosperity is indicated in your astrological profile.';
  if (!relationships) relationships = 'Meaningful relationships and connections await you.';
  if (!career) career = 'Career growth and professional success are aligned in your future.';
  if (!personalGrowth) personalGrowth = 'You are destined for significant personal growth and development.';
  if (recommendations.length === 0) {
    recommendations = [
      'Focus on maintaining physical and mental health',
      'Pursue opportunities that align with your passions',
      'Build strong relationships and networks',
      'Invest in continuous learning and self-improvement',
      'Practice mindfulness and gratitude daily',
      'Set clear goals aligned with your values',
      'Trust your intuition and inner wisdom',
    ];
  }

  return {
    health,
    wealth,
    relationships,
    career,
    personalGrowth,
    recommendations,
    fullPrediction,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json();
    const { dateOfBirth, birthTime, birthVenue } = body;

    if (!dateOfBirth || !birthTime || !birthVenue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a prompt for Gemini API
    const prompt = `You are an expert astrologer and life prediction specialist. Based on the following birth details, provide a comprehensive future prediction:

Birth Date: ${dateOfBirth}
Birth Time: ${birthTime}
Birth Location: ${birthVenue}

Please provide predictions in the following categories:

1. **HEALTH**: Detailed prediction about health, wellness, and medical advice
2. **WEALTH**: Prediction about financial prospects, investments, and prosperity
3. **RELATIONSHIPS**: Insights about love, family, and social connections
4. **CAREER & SUCCESS**: Professional growth, career opportunities, and achievements
5. **PERSONAL GROWTH**: Spiritual development, self-improvement, and life lessons
6. **RECOMMENDATIONS**: 5-7 specific actionable recommendations for a better future

Format your response as follows:
HEALTH: [detailed health prediction]
WEALTH: [detailed wealth prediction]
RELATIONSHIPS: [detailed relationships prediction]
CAREER: [detailed career prediction]
GROWTH: [detailed personal growth prediction]
RECOMMENDATIONS: 
- [recommendation 1]
- [recommendation 2]
- [recommendation 3]
- [recommendation 4]
- [recommendation 5]
- [recommendation 6]
- [recommendation 7]

FULL_PREDICTION: [A comprehensive 3-4 paragraph prediction covering all aspects of this person's future based on their birth chart and astrological influences]`;

    // Call Gemini API with correct format
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API Error:', error);
      return NextResponse.json(
        { error: 'Failed to generate prediction' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the generated text
    const parsedPrediction = parsePredictionText(generatedText);

    return NextResponse.json({
      prediction: parsedPrediction,
    });
  } catch (error) {
    console.error('Error generating prediction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
