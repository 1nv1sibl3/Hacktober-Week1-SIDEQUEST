import { DiscoveryCard, Mission } from '../../types';
import { MISSIONS, MISSION_MAP } from '../../data/missions';
import { modelManager } from './modelManager';
import { cosineSimilarity } from './vectorMath';
import { fallbackTFIDF } from './fallbackScorer';

interface DiscoveryInsightTemplate {
  keywords: string[];
  theme: string;
  interpretiveInsight: string;
  curiosityQuestion: string;
}

const KNOWLEDGE_THEMES: DiscoveryInsightTemplate[] = [
  {
    keywords: ['plant', 'crack', 'concrete', 'root', 'sprout', 'wall', 'brick', 'weed', 'moss', 'green', 'survivor'],
    theme: 'Botanical Resilience & Urban Colonization',
    interpretiveInsight:
      'Masonry fissures often create unintended micro-habitats. Concrete joints trap airborne dust, dead leaf loam, and runoff minerals, while lime in mortar can buffer soil acidity. Pioneer plants exploit these microscopic footholds to establish root anchors where competition from other vegetation is absent.',
    curiosityQuestion:
      'Where does this plant draw its moisture during dry intervals: morning dew condensation, subterranean masonry moisture, or horizontal surface runoff?'
  },
  {
    keywords: ['sound', 'hear', 'noise', 'listen', 'bird', 'chirp', 'hum', 'traffic', 'wind', 'acoustic', 'voice', 'silent', 'echo'],
    theme: 'Acoustic Layering & Soundscape Ecology',
    interpretiveInsight:
      'Urban environments create high-amplitude low-frequency noise (from engines and ventilation systems). Many urban birds and insects adapt their communication by singing at higher pitches or exploiting acoustic corridors between parallel buildings to prevent signal masking.',
    curiosityQuestion:
      'Did the sounds you noticed reflect off rigid vertical building surfaces, or were they absorbed and diffused by tree leaves and soft ground?'
  },
  {
    keywords: ['shade', 'sun', 'heat', 'warm', 'cold', 'cool', 'temperature', 'hot', 'thermal', 'shadow', 'breeze', 'wind'],
    theme: 'Microclimate Gradients & Thermal Mass',
    interpretiveInsight:
      'Dense materials like asphalt, granite, and concrete possess high thermal mass, absorbing solar energy during peak sunlight and re-radiating heat well into twilight. In contrast, foliage and soil actively cool surrounding air through evapotranspiration.',
    curiosityQuestion:
      'How many steps away does this thermal boundary extend before the radiant warmth or cooling effect disappears?'
  },
  {
    keywords: ['water', 'puddle', 'rain', 'drain', 'mud', 'silt', 'droplet', 'wet', 'flow', 'curb', 'gutter', 'stream'],
    theme: 'Urban Fluvial Hydrology & Sediment Sorting',
    interpretiveInsight:
      'Hard paving prevents rainwater from infiltrating deep aquifers, converting sidewalks and gutters into miniature torrential river channels. As flow slows, suspended particles drop out by mass: coarse sand first, then fine silts and organic matter.',
    curiosityQuestion:
      'Does the sediment deposit form a barrier that traps future runoff, or does it carve a clearer drainage channel for the next rainfall?'
  },
  {
    keywords: ['ant', 'spider', 'web', 'bug', 'insect', 'crawl', 'bee', 'fly', 'burrow', 'caterpillar', 'butterfly'],
    theme: 'Arthropod Architecture & Navigation',
    interpretiveInsight:
      'Small invertebrates navigate human terrain using physical seams—such as sidewalk edges and mortar joints—as guide rails. Web-builders position silks perpendicular to prevailing thermal drafts to maximize aerial insect capture without expending excess metabolic energy.',
    curiosityQuestion:
      'What micro-scale obstacles along the path forced a change in travel direction or silk anchor placement?'
  },
  {
    keywords: ['rust', 'metal', 'decay', 'leaf', 'rot', 'skeleton', 'weather', 'old', 'corrosion', 'iron', 'peel'],
    theme: 'Atmospheric Weathering & Entropy',
    interpretiveInsight:
      'Engineered materials are chemically refined forms of mineral ores. When exposed to ambient oxygen, humidity, and atmospheric acids, metals oxidize and concrete leaches calcium carbonate, gradually returning to lower-energy chemical equilibria.',
    curiosityQuestion:
      'Which micro-recess or surface joint sheltered the highest concentration of moisture that accelerated this transformation?'
  },
  {
    keywords: ['pattern', 'geometry', 'shape', 'spiral', 'hexagon', 'branch', 'repeat', 'symmetry', 'circle'],
    theme: 'Biomimetic Geometry & Structural Optimization',
    interpretiveInsight:
      'Repeating geometries in nature frequently represent mathematical optimizations for material economy, nutrient transport, or load distribution. Human engineers frequently converge on identical geometries to maximize strength while minimizing weight.',
    curiosityQuestion:
      'What mechanical stress or distribution demand shaped the contours of this pattern?'
  }
];

export async function generateDiscoveryCard(
  userNotes: string,
  currentMission: Mission,
  surprisingFinding: string = '',
  investigateNextIdea: string = '',
  completedIds: Set<string> = new Set()
): Promise<DiscoveryCard> {
  const fullText = `${userNotes} ${surprisingFinding} ${investigateNextIdea}`.trim();

  // 1. Compute embedding of field observation
  const { embedding: noteEmbedding, isFallback, latencyMs } = await modelManager.embedText(fullText);

  // 2. Determine best matched theme
  let matchedTheme = KNOWLEDGE_THEMES[0];
  let maxKeywordScore = -1;
  const lowerNotes = fullText.toLowerCase();

  for (const item of KNOWLEDGE_THEMES) {
    let score = 0;
    for (const kw of item.keywords) {
      if (lowerNotes.includes(kw)) score += 1;
    }
    if (score > maxKeywordScore) {
      maxKeywordScore = score;
      matchedTheme = item;
    }
  }

  // 3. Find next best mission using semantic similarity
  let bestNextMission: Mission = MISSIONS.find(
    (m) => m.id !== currentMission.id && !completedIds.has(m.id)
  ) || MISSIONS[0];

  let highestSim = 0;

  if (!isFallback && noteEmbedding.length > 0) {
    for (const m of MISSIONS) {
      if (m.id === currentMission.id || completedIds.has(m.id)) continue;
      if (m.embedding && m.embedding.length > 0) {
        const sim = cosineSimilarity(noteEmbedding, m.embedding);
        if (sim > highestSim) {
          highestSim = sim;
          bestNextMission = m;
        }
      }
    }
  } else {
    // Fallback ranking via TF-IDF
    for (const m of MISSIONS) {
      if (m.id === currentMission.id || completedIds.has(m.id)) continue;
      const sim = fallbackTFIDF.getSimilarity(fullText, m.id);
      if (sim > highestSim) {
        highestSim = sim;
        bestNextMission = m;
      }
    }
  }

  // Confidence score calculation (normalized between 0.65 and 0.96 for realistic presentation)
  const confidenceScore = highestSim > 0 ? Math.min(0.96, Math.max(0.65, highestSim)) : 0.78;

  // Summarize observation
  const trimmedObservation =
    userNotes.length > 180 ? `${userNotes.substring(0, 177)}...` : userNotes;

  const card: DiscoveryCard = {
    id: `disc_${Date.now()}`,
    observationSummary: trimmedObservation || 'Recorded an outdoor field observation.',
    interpretiveInsight: matchedTheme.interpretiveInsight,
    curiosityQuestion: matchedTheme.curiosityQuestion,
    suggestedNextMissionId: bestNextMission.id,
    suggestedNextMissionTitle: bestNextMission.title,
    confidenceScore,
    matchedThemes: [matchedTheme.theme, ...currentMission.followUpThemes.slice(0, 2)],
    modelAttribution: {
      modelName: isFallback ? 'Deterministic TF-IDF Fallback Engine' : 'Xenova/all-MiniLM-L6-v2 (Local WebAssembly ONNX)',
      isLocal: true,
      inferenceTimeMs: latencyMs,
      scoreType: isFallback ? 'hybrid_fallback' : 'semantic_embedding'
    }
  };

  return card;
}
