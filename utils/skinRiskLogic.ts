
export interface RiskFactors {
  smoke: boolean;
  drink: boolean;
  pesticide: boolean;
  age: number;
  gender: string;
  skinCancerHistory: boolean;
  cancerHistory: boolean; // Family/General
  region: string;
  diameter1: number;
  diameter2: number;
  itch: boolean;
  grow: boolean;
  hurt: boolean;
  changed: boolean;
  bleed: boolean;
  elevation: boolean;
}

export interface RiskResult {
  totalRiskScore: number; // 0-100
  riskLevel: "Low" | "Moderate" | "High" | "Very High";
  contributors: { factor: string; impact: number; description: string }[];
  recommendations: string[];
  imageClassName?: string; // What the AI classified the image as
  imageProbability?: number; // Confidence score
}

export const calculateSkinCancerRisk = (
  factors: RiskFactors,
  imageProbability: number, // 0-1 from image model (assuming 1 is malignant)
  imageClassName: string
): RiskResult => {
  let score = 0;
  const contributors = [];
  const recommendations = [];

  // --- 1. Image Analysis Integration (Weighted Heavily - Foundation of Risk) ---
  const isMalignantPrediction = 
    imageClassName.toLowerCase().includes("malignant") || 
    imageClassName.toLowerCase().includes("melanoma") ||
    imageClassName.toLowerCase().includes("carcinoma") ||
    imageClassName.toLowerCase().includes("basal") ||
    imageClassName.toLowerCase().includes("squamous");

  if (isMalignantPrediction) {
    // Malignant prediction: Higher base score
    // Use a more aggressive scaling to ensure melanoma images reach >50% with metadata
    const impact = Math.round(imageProbability * 50) + 15; // 15-65 points from image alone
    score += impact;
    contributors.push({
      factor: "AI Image Analysis",
      impact: impact,
      description: `Visual characteristics strongly resemble ${imageClassName} (${(imageProbability * 100).toFixed(1)}% confidence).`
    });
  } else {
    // Benign prediction: Start with low baseline score (not negative)
    score = 10; // Low baseline for benign lesions
    contributors.push({
      factor: "AI Image Analysis",
      impact: 10,
      description: `Visual characteristics appear benign (${imageClassName}).`
    });
  }

  // --- 2. ABCDE Rules & Lesion Symptoms (only for MALIGNANT predictions) ---
  // If image is benign, symptoms are minimized. Only personal history matters.
  
  if (isMalignantPrediction) {
    // D = Diameter > 6mm
    const maxDiameter = Math.max(factors.diameter1 || 0, factors.diameter2 || 0);
    if (maxDiameter > 6) {
      const diameterImpact = 12;
      score += diameterImpact;
      contributors.push({
        factor: "Lesion Diameter",
        impact: diameterImpact,
        description: `Lesion size (${maxDiameter}mm) exceeds the 6mm concern threshold.`
      });
    }

    // E = Evolving (Changed, Grow, Elevation)
    if (factors.changed || factors.grow) {
      const evolutionImpact = 20;
      score += evolutionImpact;
      contributors.push({
        factor: "Evolution",
        impact: evolutionImpact,
        description: "Reports of change in size, shape, or color."
      });
    }
    
    if (factors.elevation) {
      const elevationImpact = 10;
      score += elevationImpact;
      contributors.push({
        factor: "Elevation",
        impact: elevationImpact,
        description: "Lesion is elevated above skin surface."
      });
    }

    // Symptoms - Full weight for malignant predictions
    if (factors.bleed) {
      const bleedImpact = 25;
      score += bleedImpact;
      contributors.push({
        factor: "Bleeding",
        impact: bleedImpact,
        description: "Spontaneous bleeding is a warning sign."
      });
    }

    if (factors.itch || factors.hurt) {
      const symptomImpact = 10;
      score += symptomImpact;
      contributors.push({
        factor: "Sensory Symptoms",
        impact: symptomImpact,
        description: "Itching or pain associated with the lesion."
      });
    }
  }
  // For benign predictions, lesion symptoms are NOT significantly weighted

  // --- 3. For BENIGN Images: VERY Limited Metadata ---
  // Benign images should NEVER exceed 20 points total, ensuring they stay well under 50%
  if (!isMalignantPrediction) {
    // Only add minimal personal history for benign
    if (factors.skinCancerHistory) {
      const minimalHistoryImpact = 10;
      score += minimalHistoryImpact; // Max 10+10 = 20
      contributors.push({
        factor: "Personal History",
        impact: minimalHistoryImpact,
        description: "Previous history of skin cancer noted."
      });
    }
    
    // Cap benign at 20 to ensure well under 50%
    score = Math.max(0, Math.min(20, score));
  } else {
    // --- For MALIGNANT Images: Full Metadata Integration ---
    // Personal skin cancer history
    if (factors.skinCancerHistory) {
      const personalHistoryImpact = 25;
      score += personalHistoryImpact;
      contributors.push({
        factor: "Personal History",
        impact: personalHistoryImpact,
        description: "Previous history of skin cancer increases recurrence risk."
      });
    }

    // Family history
    if (factors.cancerHistory) {
      const familyImpact = 10;
      score += familyImpact;
      contributors.push({
        factor: "Family History",
        impact: familyImpact,
        description: "Family history of cancer implies genetic predisposition."
      });
    }

    // Age - Cumulative risk
    if (factors.age > 50) {
      const ageImpact = 10;
      score += ageImpact;
      contributors.push({
        factor: "Age",
        impact: ageImpact,
        description: "Age over 50 carries higher cumulative sun exposure risk."
      });
    }

    // Lifestyle - General health factors
    if (factors.smoke) {
      const smokeImpact = 5;
      score += smokeImpact;
      contributors.push({
        factor: "Smoking",
        impact: smokeImpact,
        description: "Smoking impairs healing and immune response."
      });
    }

    if (factors.pesticide) {
      const pestImpact = 5;
      score += pestImpact;
      contributors.push({
        factor: "Environmental Exposure",
        impact: pestImpact,
        description: "Exposure to pesticides/chemicals."
      });
    }
    
    // Malignant image: Allow up to 100
    score = Math.max(0, Math.min(100, score));
  }

  let riskLevel: "Low" | "Moderate" | "High" | "Very High" = "Low";
  if (score >= 75) riskLevel = "Very High";
  else if (score >= 50) riskLevel = "High";
  else if (score >= 25) riskLevel = "Moderate";

  // --- 5. Recommendations ---
  if (riskLevel === "Very High" || riskLevel === "High") {
    recommendations.push("Consult a dermatologist immediately for a professional strict examination.");
    recommendations.push("A biopsy may be required to confirm diagnosis.");
    if (factors.bleed) recommendations.push("Cover the area to prevent infection from bleeding.");
  } else if (riskLevel === "Moderate") {
    recommendations.push("Schedule a check-up with a doctor soon.");
    recommendations.push("Monitor the lesion for any further changes (ABCDE rule) weekly.");
    recommendations.push("Use total sun protection on the area.");
  } else {
    recommendations.push("Monitor the lesion monthly for changes.");
    recommendations.push("Maintain good sun protection habits (SPF 50+).");
    recommendations.push("Perform regular self-skin exams.");
  }

  return {
    totalRiskScore: score,
    riskLevel,
    contributors: contributors.sort((a, b) => b.impact - a.impact),
    recommendations,
    imageClassName: imageClassName,
    imageProbability: imageProbability
  };
};
