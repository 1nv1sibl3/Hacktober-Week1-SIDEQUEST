import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';

const missionsData = [
  {
    id: 'survivor',
    title: 'The Survivor',
    narrativeBriefing: 'Civilization paves over the earth with concrete and tar, yet life discovers microscopic fissures to colonize. Locate a plant thriving where no gardener intended.',
    objective: 'Find a plant growing out of a crack in pavement, brickwork, or concrete, and study how it anchors itself.',
    clues: [
      'Look along the expansion joints between concrete slabs or broken sidewalk edges.',
      'Check the vertical mortar lines of boundary walls or base plinths.',
      'Observe whether the plant spreads horizontally to catch scarce rainwater runoff.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['campus', 'neighborhood', 'garden', 'anywhere'],
    moods: ['curious', 'observant', 'adventurous'],
    safetyNotice: 'Stay on designated footpaths. Do not step into roadway traffic or touch damaged electrical conduits.',
    reflectionPrompts: [
      'What structural features allow this plant to anchor without rich soil?',
      'How does the surrounding masonry change the moisture or temperature around its roots?'
    ],
    followUpThemes: ['botanical resilience', 'urban cracks', 'micro-soil', 'pavement ecology'],
    semanticText: 'The Survivor. Life growing in pavement cracks, concrete fissures, and masonry. Plant resilience in harsh urban environments with minimal soil and extreme heat.'
  },
  {
    id: 'invisible-city',
    title: 'The Invisible City',
    narrativeBriefing: 'Urban soundscapes are dominated by vehicle horns and air conditioners. Beneath that cacophony lies a secondary acoustic world waiting to be isolated.',
    objective: 'Close your eyes for two minutes and isolate three distinct sounds that normally go unnoticed.',
    clues: [
      'Listen for organic rustles: dry leaves scraping asphalt or wind fluttering through high branches.',
      'Identify rhythmic mechanical hums: water pumps, distant transformers, or ceiling exhaust vents.',
      'Catch avian or insect communication bouncing between multi-story buildings.'
    ],
    duration: 5,
    difficulty: 'Gentle',
    environments: ['campus', 'neighborhood', 'garden', 'park', 'anywhere'],
    moods: ['calm', 'observant'],
    safetyNotice: 'Stand in a secure, non-congested spot away from vehicle gates or active stairways before closing your eyes.',
    reflectionPrompts: [
      'Which sound was the closest to your ears, and which originated furthest away?',
      'How did focusing on acoustic layers change your perception of time?'
    ],
    followUpThemes: ['acoustic ecology', 'soundscape layering', 'urban acoustics', 'auditory perception'],
    semanticText: 'The Invisible City. Identifying hidden, unnoticed sounds in the environment. Acoustic ecology, auditory attention, background noise filtering, birds, wind, and mechanical hums.'
  },
  {
    id: 'pattern-hunter',
    title: 'Pattern Hunter',
    narrativeBriefing: 'Human builders favor Cartesian grids, 90-degree right angles, and repetition. Nature optimizes through branching fractals, spirals, and load-bearing curves.',
    objective: 'Locate one naturally occurring geometric pattern and compare it directly to an adjacent human-made structure.',
    clues: [
      'Inspect leaf venation, pinecone scales, or spider webs against nearby chain-link fences or tiled walls.',
      'Notice how water droplets form round bead geometry over flat rectangular stone slabs.',
      'Compare tree trunk branching bifurcations with metallic scaffolding or utility poles.'
    ],
    duration: 15,
    difficulty: 'Moderate',
    environments: ['campus', 'garden', 'park', 'neighborhood'],
    moods: ['creative', 'scientific', 'observant'],
    safetyNotice: 'Inspect surfaces visually without climbing fences, tampering with construction structures, or reaching into dark crevices.',
    reflectionPrompts: [
      'What problem was the natural pattern solving (strength, water transport, surface area)?',
      'Why did the human architect choose a different geometry for the nearby artifact?'
    ],
    followUpThemes: ['biomimicry', 'geometric patterns', 'fractals', 'architecture vs nature'],
    semanticText: 'Pattern Hunter. Comparing naturally occurring fractal or organic patterns with rigid human-made geometric grids and architecture.'
  },
  {
    id: 'shade-experiment',
    title: 'The Shade Experiment',
    narrativeBriefing: 'Sunlight and structural shade create dramatic micro-worlds separated by only a few footsteps. Investigate how shade alters the sensory landscape.',
    objective: 'Locate the boundary line where full sunlight meets deep shadow and observe the microclimate difference without touching burning hot surfaces.',
    clues: [
      'Look for differences in surface dryness, dustiness, or moss growth across the shadow line.',
      'Feel the difference in ambient air temperature on your exposed forearms when stepping across the threshold.',
      'Check whether insect activity or birds congregate preferentially in one of the two zones.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['campus', 'garden', 'park', 'neighborhood', 'anywhere'],
    moods: ['scientific', 'curious', 'calm'],
    safetyNotice: 'Do not touch dark asphalt or metal surfaces that may be scalding under hot sunlight.',
    reflectionPrompts: [
      'How sharp was the transition boundary between warm and cool air?',
      'Did you notice any plants or animals actively orienting themselves toward or away from the light?'
    ],
    followUpThemes: ['microclimate', 'solar radiation', 'thermal gradient', 'urban shade'],
    semanticText: 'The Shade Experiment. Sunlight exposure versus structural shade microclimates. Temperature differentials, moisture retention, and ecological adaptation.'
  },
  {
    id: 'tiny-ecologist',
    title: 'The Tiny Ecologist',
    narrativeBriefing: 'We often scan landscapes for sweeping vistas, missing the dense metropolis existing within a single square foot of ground or tree bark.',
    objective: 'Choose an accessible 12x12 inch patch of ground, soil, or tree trunk, and inventory at least four distinct visible components or organisms.',
    clues: [
      'Look for decomposers: small ants, tiny beetles, fungus threads, or earthworm soil castings.',
      'Identify miniature plant life: moss pads, sprouting seedlings, or lichen crusts.',
      'Notice inorganic substrates: pebble grades, quartz grains, or decaying organic leaf mulch.'
    ],
    duration: 15,
    difficulty: 'Deep Focus',
    environments: ['garden', 'park', 'campus'],
    moods: ['scientific', 'observant', 'curious'],
    safetyNotice: 'Look with your eyes and do not overturn heavy rocks or disturb venomous insects or snakes.',
    reflectionPrompts: [
      'Which component appeared to have arrived most recently in this miniature zone?',
      'How does this tiny area reflect the health of the broader surrounding space?'
    ],
    followUpThemes: ['micro-ecosystems', 'soil biodiversity', 'invertebrate observation', 'moss and lichen'],
    semanticText: 'The Tiny Ecologist. Deep observation of a single square foot patch of soil, bark, or leaf litter to catalog miniature organisms and organic matter.'
  },
  {
    id: 'water-detective',
    title: 'The Water Detective',
    narrativeBriefing: 'Even on a dry, sunny afternoon, gravity and stone retain the ghost maps of past rains. Trace how water sculpts the terrain around you.',
    objective: 'Find physical evidence showing where rainwater collects, drains, or leaves behind mineral sediment.',
    clues: [
      'Look for dark mineral waterline marks on concrete curbs or boundary wall plinths.',
      'Trace silt depositions, fine gravel ripple lines, or dried mud crack patterns in shallow hollows.',
      'Inspect roof drainage downspouts and notice how the splash zone fosters specialized moss rings.'
    ],
    duration: 15,
    difficulty: 'Moderate',
    environments: ['campus', 'neighborhood', 'park', 'anywhere'],
    moods: ['scientific', 'curious', 'adventurous'],
    safetyNotice: 'Stay clear of open storm drains, manhole covers, and stagnant sewer water.',
    reflectionPrompts: [
      'If a heavy downpour occurred right now, what path would the first stream of water take?',
      'Did human paving channel the water toward a drainage point or trap it in an unintentional puddle basin?'
    ],
    followUpThemes: ['hydrology', 'drainage pathways', 'urban runoff', 'sedimentation'],
    semanticText: 'The Water Detective. Investigating evidence of rainwater drainage, runoff tracks, sediment deposits, and moisture retention in urban terrain.'
  },
  {
    id: 'forgotten-corner',
    title: 'The Forgotten Corner',
    narrativeBriefing: 'Every campus and neighborhood possesses overlooked interstitial spaces: behind the generator shed, beneath the stairwell, or tucked between boundary pillars.',
    objective: 'Visit an everyday location you walk past daily and deliberately investigate a corner you have never closely inspected before.',
    clues: [
      'Look for accumulated windblown treasures: dried seed pods, strange pebbles, or abandoned bird feathers.',
      'Examine whether quiet neglect has allowed specialized spiders or climbing creepers to flourish.',
      'Observe the quality of ambient light and whether sounds reverberate differently in this tucked-away niche.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['campus', 'neighborhood', 'anywhere'],
    moods: ['curious', 'creative', 'observant'],
    safetyNotice: 'Do not enter private locked property, high-voltage utility enclosures, or dimly lit unsafe areas.',
    reflectionPrompts: [
      'Why does human traffic bypass this specific corner?',
      'What was the most surprising artifact or living organism sheltering there?'
    ],
    followUpThemes: ['overlooked spaces', 'liminal geography', 'urban ecology', 'mindful noticing'],
    semanticText: 'The Forgotten Corner. Exploring overlooked interstitial spaces and ignored nooks in everyday familiar environments.'
  },
  {
    id: 'microclimate-mystery',
    title: 'The Microclimate Mystery',
    narrativeBriefing: 'Cities are not homogenous thermal blankets. Buildings, foliage, and brick walls create a patchwork of miniature climate zones.',
    objective: 'Compare how ambient air and humidity feel in two nearby spots (such as an open plaza versus a shaded breezeway).',
    clues: [
      'Observe leaf flutter: does a narrow corridor create a venturi wind tunnel while a courtyard remains still?',
      'Take a slow breath through your nose in both spots: can you detect damp soil odor vs hot stone scent?',
      'Observe whether condensation or surface dew survives longer in one of the locations.'
    ],
    duration: 10,
    difficulty: 'Moderate',
    environments: ['campus', 'neighborhood', 'park', 'garden'],
    moods: ['scientific', 'observant'],
    safetyNotice: 'Stay alert to surroundings while closing your eyes to gauge wind and humidity.',
    reflectionPrompts: [
      'What structural or natural obstacles produced the breeze corridor or humidity trap?',
      'Which of the two microclimates would you choose if seeking natural thermal comfort?'
    ],
    followUpThemes: ['urban heat island', 'microclimates', 'venturi airflow', 'thermal comfort'],
    semanticText: 'The Microclimate Mystery. Comparing temperature, air circulation, humidity, and scent across distinct microclimate zones.'
  },
  {
    id: 'five-minute-phenomenon',
    title: 'The Five-Minute Phenomenon',
    narrativeBriefing: 'We perceive nature as static because our attention moves too rapidly. When we anchor ourselves to a single coordinate, subtle dynamism emerges.',
    objective: 'Sit or stand perfectly still for five continuous minutes focusing on a single plant, branch, or patch of lawn to catch active changes.',
    clues: [
      'Notice subtle sway responses to fluctuating wind gusts.',
      'Observe insect visitors arriving, inspecting, and departing.',
      'Track the millimeter creep of a shadow boundary across a leaf blade.'
    ],
    duration: 5,
    difficulty: 'Gentle',
    environments: ['garden', 'campus', 'park', 'anywhere'],
    moods: ['calm', 'observant'],
    safetyNotice: 'Choose a shaded, comfortable spot where you will not block pedestrian pathways.',
    reflectionPrompts: [
      'What motion occurred during those five minutes that you would have missed if walking past?',
      'How did your internal sense of pace shift between minute one and minute five?'
    ],
    followUpThemes: ['temporal observation', 'stillness', 'insect activity', 'shadow movement'],
    semanticText: 'The Five-Minute Phenomenon. Anchoring attention to a single natural spot for 5 minutes to witness subtle motion, wind, and insect visits.'
  },
  {
    id: 'canopy-kaleidoscope',
    title: 'Canopy Kaleidoscope',
    narrativeBriefing: 'Looking straight up inverts our conventional perspective. The sky becomes a blank canvas segmented by leaves and architectural cornices.',
    objective: 'Look directly upward toward the sky through tree canopies or overhead roofs and analyze the negative space.',
    clues: [
      'Look for "crown shyness": gaps where adjacent tree branches deliberately avoid touching each other.',
      'Observe how leaf clusters filter and tint the color of the overhead sky.',
      'Notice silhouettes of utility wires or architectural edges intersecting with foliage.'
    ],
    duration: 5,
    difficulty: 'Gentle',
    environments: ['campus', 'park', 'garden', 'neighborhood'],
    moods: ['creative', 'calm', 'observant'],
    safetyNotice: 'Stop walking before looking straight up to prevent tripping over curbs or steps.',
    reflectionPrompts: [
      'Did the tree canopies form interlocking puzzle pieces or leave wide light channels?',
      'How did changing your vertical gaze angle affect your sense of scale?'
    ],
    followUpThemes: ['crown shyness', 'foliage geometry', 'canopy architecture', 'negative space'],
    semanticText: 'Canopy Kaleidoscope. Looking upward into tree canopies and overhead structures, observing crown shyness, leaf silhouettes, and negative space.'
  },
  {
    id: 'lichen-chronicles',
    title: 'The Lichen Chronicles',
    narrativeBriefing: 'Lichen is not a single organism, but a symbiotic partnership between fungi and algae, serving as an ancient living air quality monitor.',
    objective: 'Examine tree bark, stone monuments, or old boundary walls for crustose or foliose lichen patches.',
    clues: [
      'Look for pale sage-green, orange, or grey crusty maps spreading outward on north-facing bark.',
      'Notice whether lichen thrives more abundantly away from vehicle exhaust routes.',
      'Observe concentric circular growth rings indicating decades of slow expansion.'
    ],
    duration: 15,
    difficulty: 'Moderate',
    environments: ['park', 'campus', 'garden'],
    moods: ['scientific', 'observant'],
    safetyNotice: 'Observe visually without scratching or scraping living bark or historic stone surfaces.',
    reflectionPrompts: [
      'What color varieties did you find, and did they favor specific textured bark or stones?',
      'Does the abundance of lichen indicate cleaner local micro-air quality in this area?'
    ],
    followUpThemes: ['lichen symbiosis', 'bioindicators', 'air quality', 'slow growth biology'],
    semanticText: 'The Lichen Chronicles. Searching for lichen growth on trees and rocks as bioindicators of microclimate age and air quality.'
  },
  {
    id: 'ant-highway-architects',
    title: 'Ant Highway Architects',
    narrativeBriefing: 'Ants solve complex topological routing problems without centralized leadership, carving invisible chemical superhighways across urban terrain.',
    objective: 'Locate a column of foraging ants and trace their path along stone edges or tree trunks to deduce their destination.',
    clues: [
      'Look along the transition seam where a wall meets the ground or along horizontal tree branches.',
      'Observe how workers pause to communicate using antennae tapping when meeting head-on.',
      'Identify what resources (bread crumbs, nectar drops, insect prey) are being transported back.'
    ],
    duration: 10,
    difficulty: 'Moderate',
    environments: ['campus', 'garden', 'neighborhood', 'anywhere'],
    moods: ['curious', 'scientific', 'observant'],
    safetyNotice: 'Keep a respectful distance. Do not crush ants or put your hands near aggressive biting colonies.',
    reflectionPrompts: [
      'How did the colony navigate around obstacles or rough textures on the path?',
      'What direction did laden ants travel versus empty foragers heading out?'
    ],
    followUpThemes: ['swarm intelligence', 'foraging trails', 'insect navigation', 'pheromones'],
    semanticText: 'Ant Highway Architects. Observing ant foraging trails, collective navigation, obstacle negotiation, and resource transport along urban seams.'
  },
  {
    id: 'balcony-oasis',
    title: 'The Balcony Oasis',
    narrativeBriefing: 'Potted plants on balconies and window sills represent suspended stepping stones for urban wildlife in the vertical city.',
    objective: 'Investigate a balcony or potted plant garden to identify miniature ecological interactions.',
    clues: [
      'Check the underside of container rims for sheltering geckos, spiders, or dormant snails.',
      'Inspect the soil surface of potted plants for beneficial mycorrhizal webs or moss pads.',
      'Notice whether visiting butterflies, bees, or sunbirds pause at specific floral blooms.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['garden', 'campus', 'neighborhood', 'anywhere'],
    moods: ['calm', 'curious', 'observant'],
    safetyNotice: 'Never lean over balcony railings or place heavy objects precariously on parapets.',
    reflectionPrompts: [
      'How does container soil dry out compared to open ground soil?',
      'What visiting creatures have discovered this vertical ecological island?'
    ],
    followUpThemes: ['vertical ecology', 'container gardening', 'urban stepping stones', 'pollinator stations'],
    semanticText: 'The Balcony Oasis. Balcony and window sill potted plant micro-ecosystems, container soil dynamics, and vertical urban wildlife stepping stones.'
  },
  {
    id: 'rust-and-renewal',
    title: 'Rust and Renewal',
    narrativeBriefing: 'Iron longs to return to iron oxide; stone craves erosion. Weathering is nature reclaiming engineered materials atom by atom.',
    objective: 'Find an outdoor metal gate, handrail, or bolt exhibiting oxidation and study the color gradients of its patina.',
    clues: [
      'Observe color transitions from metallic steel through yellow-ochre to deep burnt umber rust.',
      'Check where moisture collects: bolt recesses, weld seams, or joint junctions.',
      'Look for flaking layers where atmospheric moisture has penetrated beneath protective paint coats.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['campus', 'neighborhood', 'anywhere'],
    moods: ['observant', 'creative', 'scientific'],
    safetyNotice: 'Do not touch jagged rusted metal edges or peeling industrial paint.',
    reflectionPrompts: [
      'Where did the oxidation begin, and why did that point trap the most moisture?',
      'How does the texture of the weathered metal compare to unweathered surfaces nearby?'
    ],
    followUpThemes: ['oxidation', 'material weathering', 'entropy', 'corrosion chemistry'],
    semanticText: 'Rust and Renewal. Oxidation, weathering, and patina formation on outdoor metal gates, bolts, and architectural hardware.'
  },
  {
    id: 'breeze-corridor',
    title: 'The Breeze Corridor',
    narrativeBriefing: 'Buildings act as synthetic canyons, accelerating gentle thermal breezes into aerodynamic air currents.',
    objective: 'Identify a narrow gap between two structures and test for localized air acceleration and temperature shifts.',
    clues: [
      'Look for airborne particles: swirling dust devils, drifting dry leaves, or flapping paper notices.',
      'Hold up a loose thread, blade of grass, or your fingertip to gauge wind direction shifts.',
      'Listen for wind whistle tones generated against sharp architectural edges.'
    ],
    duration: 10,
    difficulty: 'Moderate',
    environments: ['campus', 'neighborhood'],
    moods: ['scientific', 'adventurous', 'observant'],
    safetyNotice: 'Be vigilant for opening doors or vehicular movement through building driveways.',
    reflectionPrompts: [
      'How did wind speed in the narrow corridor compare to the wider open street?',
      'Did the air channel feel significantly cooler due to convective heat dissipation?'
    ],
    followUpThemes: ['venturi effect', 'urban canyons', 'aerodynamics', 'microclimate wind'],
    semanticText: 'The Breeze Corridor. Investigating aerodynamic wind corridors and venturi effects between parallel buildings and campus passageways.'
  },
  {
    id: 'shadow-clock',
    title: 'The Shadow Clock',
    narrativeBriefing: 'Before clocks divided days into synthetic digital seconds, every pole and sundial translated planetary rotation into a moving shadow ribbon.',
    objective: 'Pick a prominent vertical shadow cast by a lamppost, tree, or pillar, and mark its tip mentally to observe its solar transit.',
    clues: [
      'Note the sharpness of the shadow edge (the umbra) versus the softer fuzzy border (penumbra).',
      'Observe the color of the shadowed ground: notice it is not black, but illuminated by diffuse blue skylight.',
      'After five minutes, check how many centimeters the shadow apex has shifted eastward.'
    ],
    duration: 15,
    difficulty: 'Moderate',
    environments: ['campus', 'park', 'neighborhood', 'anywhere'],
    moods: ['scientific', 'calm', 'observant'],
    safetyNotice: 'Never look directly at the sun. Observe only the ground shadows.',
    reflectionPrompts: [
      'How far did the shadow tip migrate in just a few minutes of real time?',
      'How did the angle of the shadow reveal the approximate hour of the day?'
    ],
    followUpThemes: ['sundial physics', 'celestial mechanics', 'diffuse light', 'shadow tracking'],
    semanticText: 'The Shadow Clock. Tracking solar motion and shadow migration cast by lampposts and pillars. Observing umbra and diffuse skylight.'
  },
  {
    id: 'bark-topography',
    title: 'Bark Topography',
    narrativeBriefing: 'Tree bark is an armored skin tailored to protect sap vessels from heat, insect boreholes, and fungal spores, featuring mountain-like relief ridges.',
    objective: 'Compare the bark texture and vertical furrow geometry of two distinct mature trees.',
    clues: [
      'Look for deeply fissured vertical ridges (like neem or oak) versus smooth peeling sheets (like eucalyptus or birch).',
      'Examine whether insects or moss colonize the valleys of the fissures rather than the exposed crests.',
      'Notice how the bark texture changes between ground level and shoulder height.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['park', 'campus', 'garden'],
    moods: ['observant', 'scientific', 'curious'],
    safetyNotice: 'Observe closely with eyes; do not peel living bark or disturb stinging insects.',
    reflectionPrompts: [
      'How do the vertical grooves facilitate shedding or directing rainwater toward roots?',
      'Which tree bark offered more micro-habitats for small arthropods?'
    ],
    followUpThemes: ['dendrology', 'tree bark ecology', 'bark textures', 'plant morphology'],
    semanticText: 'Bark Topography. Analyzing bark furrow depth, patterns, textures, and microhabitats on mature urban trees.'
  },
  {
    id: 'twilight-transition',
    title: 'The Twilight Transition',
    narrativeBriefing: 'The boundary hour between sunset and dusk triggers an abrupt ecological shift: diurnal birds fall silent while nocturnal insects and bats awaken.',
    objective: 'Witness the sensory shift during twilight as ambient daylight gives way to evening shadows.',
    clues: [
      'Watch for common mynas or sparrows gathering in communal roosting trees with crescendo chirping.',
      'Notice the sky shifting through cyan to indigo as artificial amber streetlights blink awake.',
      'Listen for the abrupt emergence of crickets, cicadas, or tree frogs as the heat fades.'
    ],
    duration: 15,
    difficulty: 'Moderate',
    environments: ['park', 'campus', 'neighborhood', 'garden', 'anywhere'],
    moods: ['calm', 'observant', 'curious'],
    safetyNotice: 'Stay in well-lit, familiar public grounds during twilight.',
    reflectionPrompts: [
      'What was the exact moment you realized daylight had yielded to nightfall?',
      'Did the sounds of traffic seem louder or quieter as the natural chorus shifted?'
    ],
    followUpThemes: ['crepuscular biology', 'circadian rhythms', 'twilight soundscapes', 'dusk transition'],
    semanticText: 'The Twilight Transition. Observing sensory and ecological changes during dusk and twilight, bird roosting, and nocturnal insect awakenings.'
  },
  {
    id: 'silk-engineer',
    title: 'The Silk Engineer',
    narrativeBriefing: 'Spider silk possesses higher tensile strength than high-grade alloy steel and is spun into sophisticated vibration-sensing nets.',
    objective: 'Find an intact spider web suspended outdoors and study its tension points and spatial anchor architecture.',
    clues: [
      'Look around sheltered corners: outdoor lamp fixtures, garden hedges, or metal window grilles.',
      'Notice the radial anchor lines carrying structural weight versus the sticky spiral capture threads.',
      'Check if the web is aligned with ambient wind currents to catch flying insects without tearing.'
    ],
    duration: 10,
    difficulty: 'Moderate',
    environments: ['garden', 'campus', 'neighborhood', 'anywhere'],
    moods: ['curious', 'scientific', 'observant'],
    safetyNotice: 'Do not destroy webs or touch spiders. Observe from a respectful 12-inch distance.',
    reflectionPrompts: [
      'How was the web anchored to withstand wind or rain without snapping?',
      'Was the spider waiting at the center hub or hidden in a silk retreat retreat nearby?'
    ],
    followUpThemes: ['arachnid engineering', 'spider silk', 'structural tension', 'biomechanics'],
    semanticText: 'The Silk Engineer. Studying spider web architecture, tension anchors, radial spokes, and positioning relative to air drafts.'
  },
  {
    id: 'pollinator-patrol',
    title: 'The Pollinator Patrol',
    narrativeBriefing: 'Eighty percent of flowering plants rely on insect intermediaries to exchange genetic material. Observe these vital couriers in action.',
    objective: 'Locate flowering plants or ornamental bushes and track the flight maneuvers of two different visiting pollinators.',
    clues: [
      'Look for honeybees, solitary carpenter bees, hoverflies, or small skipper butterflies.',
      'Observe whether the pollinator lands deliberately on specific petal color patterns (nectar guides).',
      'Count how many seconds a pollinator spends visiting an individual blossom before taking flight.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['garden', 'park', 'campus'],
    moods: ['curious', 'observant', 'calm'],
    safetyNotice: 'Do not swat at or crowd bees and wasps. Move slowly and give them room to forage peacefully.',
    reflectionPrompts: [
      'Did different pollinator species prefer different flower colors or petal shapes?',
      'Could you see pollen baskets (corbiculae) packed with yellow or orange grains on bee legs?'
    ],
    followUpThemes: ['pollination ecology', 'floral biology', 'insect behavior', 'nectar guides'],
    semanticText: 'The Pollinator Patrol. Observing pollinators, bees, butterflies, and hoverflies foraging on flowering plants, noting floral preferences and flight paths.'
  },
  {
    id: 'puddle-cosmos',
    title: 'The Puddle Cosmos',
    narrativeBriefing: 'A shallow depression holding water becomes an optical lens, reflecting the sky while silting miniature tectonic layers along its muddy margins.',
    objective: 'Find a recent or drying puddle and examine the surface reflection and perimeter silt sedimentation.',
    clues: [
      'Observe the mirror reflection of overhead clouds and tree branches across the still water surface.',
      'Inspect the drying shoreline where fine clay particles curl into delicate dried mud plates.',
      'Look for surface tension phenomena: water striders walking on the meniscus or floating seed hulls.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['neighborhood', 'campus', 'park'],
    moods: ['creative', 'calm', 'scientific'],
    safetyNotice: 'Do not walk into murky standing water or touch runoff that may contain contaminants.',
    reflectionPrompts: [
      'How did wind rippling across the surface distort the reflected image of buildings or sky?',
      'What distinct sediment layers separated as the water evaporated?'
    ],
    followUpThemes: ['surface tension', 'reflection optics', 'sedimentation', 'ephemeral waters'],
    semanticText: 'The Puddle Cosmos. Examining reflections, surface tension meniscus, and silt drying patterns along the edges of puddles.'
  },
  {
    id: 'thermal-memory',
    title: 'Thermal Memory',
    narrativeBriefing: 'Dense masonry, granite stones, and concrete absorb solar thermal energy all afternoon, re-radiating warmth into the cool evening air like miniature radiators.',
    objective: 'During late afternoon or twilight, compare the heat retained by a thick stone or brick wall versus an adjacent wooden bench or metal rail.',
    clues: [
      'Hold the palm of your hand 1 inch away from a thick west-facing concrete wall to feel radiant heat waves without touching.',
      'Compare with foliage or grass, which cool rapidly through transpiration.',
      'Look for geckos or nocturnal moths basking on the warm masonry to absorb lingering heat.'
    ],
    duration: 10,
    difficulty: 'Moderate',
    environments: ['campus', 'neighborhood', 'anywhere'],
    moods: ['scientific', 'observant'],
    safetyNotice: 'Do not touch scalding metal. Hover your hand at a safe distance.',
    reflectionPrompts: [
      'Which building material retained the highest perceptible thermal energy?',
      'How does this thermal mass effect contribute to your city feeling warmer at night?'
    ],
    followUpThemes: ['thermal mass', 'urban heat island', 'radiative cooling', 'building materials'],
    semanticText: 'Thermal Memory. Comparing radiant heat retention of concrete, brick, and stone walls during evening hours versus vegetation and wood.'
  },
  {
    id: 'boundary-creepers',
    title: 'The Boundary Creepers',
    narrativeBriefing: 'Climbing vines and tendril-bearing creepers defy gravity by clutching architectural surfaces with specialized adhesive pads and coiled stems.',
    objective: 'Locate a climbing plant ascending a wall, fence, or tree trunk, and inspect its mechanical climbing strategy.',
    clues: [
      'Look for spring-like tendril coils that absorb wind shocks like automotive suspension.',
      'Inspect aerial rootlets or sticky sucker pads gripping brick texture directly.',
      'Observe whether the plant spirals clockwise or counter-clockwise as it ascends.'
    ],
    duration: 10,
    difficulty: 'Moderate',
    environments: ['garden', 'campus', 'neighborhood', 'anywhere'],
    moods: ['curious', 'scientific', 'observant'],
    safetyNotice: 'Do not yank or pull on climbing vines, which may dislodge loose bricks or mortar.',
    reflectionPrompts: [
      'What mechanical tool does the plant tendril resemble (spring, suction cup, grappling hook)?',
      'How does the plant sense where the next sturdy anchor point lies?'
    ],
    followUpThemes: ['thigmotropism', 'climbing plants', 'tendril mechanics', 'plant movement'],
    semanticText: 'The Boundary Creepers. Climbing vines, tendril springs, and adhesive pads ascending masonry walls and wire fences.'
  },
  {
    id: 'fallen-leaf-mosaic',
    title: 'Fallen Leaf Mosaic',
    narrativeBriefing: 'A decaying leaf on the ground is not dead waste; it is an active microbial reactor transferring stored solar energy back into the living soil food web.',
    objective: 'Gather a visual survey of three fallen leaves showing progressive stages of decomposition.',
    clues: [
      'Find a fresh leaf: supple, retaining residual pigmentation (green, amber, red).',
      'Find a dry brown leaf: brittle, displaying raised vascular skeleton ribs.',
      'Find a skeletonized leaf: where soft mesophyll tissue has been consumed by microbes, leaving only delicate lace veins.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['park', 'garden', 'campus'],
    moods: ['calm', 'creative', 'scientific'],
    safetyNotice: 'Examine leaves on clean ground. Do not rummage through wet decaying piles that might harbor centipedes.',
    reflectionPrompts: [
      'Which vascular veins resisted decomposition the longest (central midrib vs fine capillaries)?',
      'How does the scent of decaying autumn leaves differ from fresh green foliage?'
    ],
    followUpThemes: ['decomposition', 'soil nutrients', 'leaf skeletonization', 'organic recycling'],
    semanticText: 'Fallen Leaf Mosaic. Investigating stages of leaf decay, vascular skeletonization, and soil nutrient cycling on the ground.'
  },
  {
    id: 'acoustic-horizon',
    title: 'The Acoustic Horizon',
    narrativeBriefing: 'Our visual field spans roughly 180 degrees forward, but our hearing receives a 360-degree spherical sphere of spatial awareness.',
    objective: 'Stand in one spot for three minutes and map the furthest audible sound source in every cardinal direction (North, South, East, West).',
    clues: [
      'Listen for high-pitched bird calls that travel clearly across open space.',
      'Detect the deep sub-bass rumble of distant heavy vehicles or diesel trains.',
      'Notice how nearby buildings reflect and echo sounds from unexpected angles.'
    ],
    duration: 10,
    difficulty: 'Moderate',
    environments: ['campus', 'park', 'neighborhood', 'anywhere'],
    moods: ['observant', 'calm'],
    safetyNotice: 'Choose a safe, pedestrian-only area so you can focus on auditory listening safely.',
    reflectionPrompts: [
      'What was the most distant sound you could clearly identify?',
      'Did sound travel farther from one specific direction due to wind or fewer building obstacles?'
    ],
    followUpThemes: ['spatial acoustics', 'auditory mapping', 'acoustic horizon', 'echo refraction'],
    semanticText: 'The Acoustic Horizon. Mapping distant 360-degree sounds across cardinal directions, detecting echoes and furthest audible acoustic landmarks.'
  },
  {
    id: 'soil-surface-crypts',
    title: 'Soil Surface Crypts',
    narrativeBriefing: 'Bare ground may look dry and empty, but closer inspection reveals micro-craters, animal footprint indentations, and mineral crusts.',
    objective: 'Inspect a 2-foot patch of unpaved earth and discover evidence of past animal or insect activity.',
    clues: [
      'Look for conical pitfall traps dug into fine dust by antlion larvae.',
      'Find miniature pellets of excavated soil around pencil-diameter beetle or spider burrows.',
      'Detect dried rain splatter craters where large raindrops impacted soft dust.'
    ],
    duration: 10,
    difficulty: 'Moderate',
    environments: ['garden', 'campus', 'park'],
    moods: ['curious', 'scientific', 'observant'],
    safetyNotice: 'Do not poke sticks or fingers into animal burrows.',
    reflectionPrompts: [
      'What engineered structure (pit, burrow mound, or crater) did you locate?',
      'How does dry topsoil protect the moister soil layers underneath?'
    ],
    followUpThemes: ['soil ecology', 'antlion traps', 'burrow structures', 'micro-geomorphology'],
    semanticText: 'Soil Surface Crypts. Discovering insect burrow mounds, antlion pit traps, and soil surface micro-features in bare ground.'
  },
  {
    id: 'rooftop-vistas',
    title: 'Rooftop Vistas & Sky Currents',
    narrativeBriefing: 'Ascending to a high balcony or accessible rooftop terrace reveals the open atmospheric envelope of the city, where weather actually happens.',
    objective: 'Look toward the horizon from a safe balcony or elevated viewpoint and study cloud motion and thermal currents.',
    clues: [
      'Notice whether low cumulus clouds are traveling in a different direction than high wispy cirrus.',
      'Observe black kites or crows circling in thermals without flapping their wings.',
      'Look across the horizon for patches of haze or smoke revealing atmospheric inversion layers.'
    ],
    duration: 15,
    difficulty: 'Moderate',
    environments: ['campus', 'neighborhood', 'anywhere'],
    moods: ['adventurous', 'observant', 'calm'],
    safetyNotice: 'Only use safe, approved viewing terraces with high safety parapets. Never climb barriers or step near unguarded edges.',
    reflectionPrompts: [
      'Could you spot thermal soaring birds riding invisible columns of warm rising air?',
      'How did viewing the city from above alter your perception of its green tree cover?'
    ],
    followUpThemes: ['thermal updrafts', 'cloud formations', 'soaring birds', 'urban topography'],
    semanticText: 'Rooftop Vistas and Sky Currents. Observing cloud motion, thermal updrafts, soaring raptors, and atmospheric haze from elevated viewpoints.'
  },
  {
    id: 'artificial-creek',
    title: 'The Artificial Creek',
    narrativeBriefing: 'Street curbs and drainage channels are human-engineered analogues to mountain streams, hosting miniature gravel sandbars and moss meadows.',
    objective: 'Walk along a concrete curb gutter and find where accumulated silt has formed a miniature alluvial deposit.',
    clues: [
      'Look for sorted bands of sediment: larger pebbles settled first, followed by fine dark loam.',
      'Check where sidewalk joints trap moisture, nurturing emerald-green velvet moss colonies.',
      'Notice how discarded tree seed pods accumulate along the curb like driftwood.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['neighborhood', 'campus'],
    moods: ['scientific', 'observant', 'curious'],
    safetyNotice: 'Walk on the sidewalk facing away from moving cars. Never step out into traffic lanes.',
    reflectionPrompts: [
      'How closely did the sediment sorting mimic a natural mountain riverbed?',
      'What plants had already begun germinating in the trapped gutter soil?'
    ],
    followUpThemes: ['fluvial geomorphology', 'urban silt', 'curb ecology', 'alluvial deposits'],
    semanticText: 'The Artificial Creek. Examining curb gutters as miniature alluvial stream channels with sorted sediment and moss colonies.'
  },
  {
    id: 'geometric-echoes',
    title: 'Geometric Echoes',
    narrativeBriefing: 'Nature and human engineers frequently arrive at identical geometric solutions independently, guided by the immutable laws of physics.',
    objective: 'Find a repeating geometric motif (such as hexagons, spirals, or radial spokes) in both an organic element and a manufactured object.',
    clues: [
      'Look for hexagons: honeycomb patterns, dried mud cracking, or paving tiles.',
      'Look for spirals: snail shells, fern fronds, or spiraling electrical wires and handrail curves.',
      'Look for radial spokes: bicycle wheels, umbrella struts, or sunflower center florets.'
    ],
    duration: 15,
    difficulty: 'Deep Focus',
    environments: ['campus', 'garden', 'neighborhood', 'anywhere'],
    moods: ['creative', 'scientific', 'curious'],
    safetyNotice: 'Maintain safe distance from moving machinery and bicycle traffic.',
    reflectionPrompts: [
      'Why is that specific geometry so structurally efficient in both contexts?',
      'Did the biological or manufactured version display more irregularities?'
    ],
    followUpThemes: ['biomimicry', 'geometry in nature', 'hexagons and spirals', 'structural efficiency'],
    semanticText: 'Geometric Echoes. Finding identical geometric patterns (hexagons, spirals, radials) in living nature and manufactured objects.'
  },
  {
    id: 'monsoon-memory',
    title: 'Monsoon Memory',
    narrativeBriefing: 'Water possesses tremendous kinetic energy. Long after floods recede, ground soil bears witness to the power of flowing water.',
    objective: 'Search an unpaved slope or garden verge for carved erosion rills and flood drift lines.',
    clues: [
      'Look for miniature canyons or V-shaped channels carved through bare dirt by rushing water.',
      'Notice tide lines of dried leaves and twigs trapped against tree trunks or fence bases.',
      'Inspect exposed tree roots where surrounding topsoil was washed away.'
    ],
    duration: 10,
    difficulty: 'Moderate',
    environments: ['campus', 'park', 'garden'],
    moods: ['scientific', 'adventurous'],
    safetyNotice: 'Do not hike down steep, unstable mud banks or slippery slopes.',
    reflectionPrompts: [
      'How deep was the erosion channel, and what stabilized its banks (roots, stones)?',
      'Where did the washed-out soil ultimately come to rest?'
    ],
    followUpThemes: ['soil erosion', 'water runoff', 'fluvial erosion', 'landscape change'],
    semanticText: 'Monsoon Memory. Investigating carved erosion rills, drift lines, and exposed roots left behind by heavy rainwater flows.'
  },
  {
    id: 'urban-seed-travelers',
    title: 'The Urban Seed Travelers',
    narrativeBriefing: 'Plants are stationary, but their offspring are daring aerodynamic explorers equipped with wings, parachutes, or adhesive velcro hooks.',
    objective: 'Find two distinct plant seeds and analyze their biological dispersal mechanisms.',
    clues: [
      'Look for wind-riders: dandelion pappus fluff, milkweed tufts, or helicopter samara pods.',
      'Look for animal-hitchhikers: burrs and thorny seeds designed to cling to animal fur or socks.',
      'Look for gravity-rollers: heavy nuts or round berries that roll downhill.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['park', 'garden', 'campus', 'neighborhood'],
    moods: ['curious', 'scientific', 'observant'],
    safetyNotice: 'Do not ingest any seeds or wild berries. Wash hands after handling garden plants.',
    reflectionPrompts: [
      'How far could this seed travel on a brisk afternoon gust of wind?',
      'What physical feature makes its dispersal method effective in a concrete-heavy city?'
    ],
    followUpThemes: ['seed dispersal', 'aerodynamic seeds', 'botanical physics', 'plant reproduction'],
    semanticText: 'The Urban Seed Travelers. Finding and analyzing aerodynamic winged seeds, parachutes, and burrs designed for dispersal.'
  },
  {
    id: 'birdsong-triangulation',
    title: 'Birdsong Triangulation',
    narrativeBriefing: 'Birds use acoustics to claim territory and warn of predators. Because sound is directional, your ears can pinpoint perches through dense foliage.',
    objective: 'Listen for a distinct birdsong and locate the exact calling bird in a tree canopy without using binoculars.',
    clues: [
      'Listen for repetitive, melodic calls of tailorbirds, sunbirds, common mynas, or robins.',
      'Turn your head slowly until the volume sounds balanced between both ears to establish the direction line.',
      'Scan the high canopy for sudden silhouette head twitches or tail bobs matching the call cadence.'
    ],
    duration: 10,
    difficulty: 'Moderate',
    environments: ['park', 'campus', 'garden', 'anywhere'],
    moods: ['observant', 'curious', 'calm'],
    safetyNotice: 'Watch your footing on tree roots or uneven turf while looking up into canopies.',
    reflectionPrompts: [
      'Were you able to spot the caller, and what perch vantage had it chosen?',
      'Did another bird in a neighboring tree answer its call?'
    ],
    followUpThemes: ['ornithology', 'birdsong territoriality', 'acoustic triangulation', 'canopy observation'],
    semanticText: 'Birdsong Triangulation. Locating calling birds in tree canopies by sound directionality, acoustic triangulation, and silhouette movement.'
  },
  {
    id: 'concrete-efflorescence',
    title: 'Concrete Efflorescence',
    narrativeBriefing: 'When rainwater permeates porous concrete or brickwork, it dissolves internal calcium salts and deposits them as white mineral crystals upon evaporating.',
    objective: 'Find a patch of white crystalline mineral salt bloom (efflorescence) on an aging retaining wall or foundation.',
    clues: [
      'Look along damp boundary walls or under overhanging concrete balcony slabs.',
      'Observe the chalky or glistening crust that resembles miniature limestone stalactites.',
      'Notice how the crystalline bloom follows internal water seepage cracks.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['campus', 'neighborhood', 'anywhere'],
    moods: ['scientific', 'observant'],
    safetyNotice: 'Do not touch or scrape chemical powder into eyes or mouth.',
    reflectionPrompts: [
      'What route did moisture take through the wall to deposit those mineral salts?',
      'Does the crystallization pattern reveal hidden stress fractures in the structure?'
    ],
    followUpThemes: ['efflorescence', 'mineral crystallization', 'concrete chemistry', 'moisture seepage'],
    semanticText: 'Concrete Efflorescence. White mineral salt crystallization blooms on masonry and retaining walls caused by evaporated moisture seepage.'
  },
  {
    id: 'dew-and-condensation',
    title: 'Dew & Condensation Witness',
    narrativeBriefing: 'Atmospheric moisture condenses into liquid droplets when surface temperatures drop below the dew point, creating miniature spherical optical lenses.',
    objective: 'Find condensation droplets on outdoor surfaces (leaves, parked vehicle roofs, or handrails) and observe their contact angles.',
    clues: [
      'Compare droplets on waxy hydrophobic leaves (like lotus or colocasia) versus porous stones.',
      'Observe how surface tension holds beads in near-spherical domes.',
      'Notice how morning sunlight refracts through each droplet, creating sparkling prism pinpoints.'
    ],
    duration: 5,
    difficulty: 'Gentle',
    environments: ['garden', 'campus', 'park', 'anywhere'],
    moods: ['calm', 'creative', 'scientific'],
    safetyNotice: 'Observe outdoor plants carefully without stepping onto wet, slick pathways.',
    reflectionPrompts: [
      'Why did droplets bead up on some materials while spreading flat on others?',
      'Did you see your own reflection or the sky mirrored inside a single dewdrop?'
    ],
    followUpThemes: ['surface tension', 'hydrophobicity', 'dew point', 'capillary optics'],
    semanticText: 'Dew and Condensation Witness. Examining dew drops, hydrophobic surface beading, surface tension, and light refraction on leaves and metal.'
  },
  {
    id: 'phototropism-and-night-lights',
    title: 'Phototropism & Artificial Light',
    narrativeBriefing: 'Plants orient their leaves toward light sources through hormone auxin redistribution, while streetlights create perpetual artificial days for street-side foliage.',
    objective: 'Compare leaves of a bush or tree growing close to a bright streetlight against foliage growing in deep darkness.',
    clues: [
      'Observe leaf angles: are leaves oriented toward the street lamp or daytime solar path?',
      'Check if foliage under artificial light retains green pigmentation longer into autumn.',
      'Notice insect predators (like small geckos or orb-weaver spiders) positioned adjacent to the light cone.'
    ],
    duration: 15,
    difficulty: 'Moderate',
    environments: ['neighborhood', 'campus', 'anywhere'],
    moods: ['scientific', 'observant', 'curious'],
    safetyNotice: 'Observe from a safe public pavement. Do not touch electrical lampposts or wiring.',
    reflectionPrompts: [
      'How has artificial lighting altered the natural day-night cycle for this plant?',
      'What nocturnal creatures have exploited the light beam as a hunting ground?'
    ],
    followUpThemes: ['phototropism', 'light pollution', 'urban ecology', 'auxin biology'],
    semanticText: 'Phototropism and Artificial Light. How streetlights and artificial illumination affect leaf orientation, plant dormancy, and nocturnal spider or gecko activity.'
  },
  {
    id: 'campus-corridor-drift',
    title: 'Campus Corridor Drift',
    narrativeBriefing: 'Architectural breezeways and institutional corridors channel temperature, echoing footfalls, and shifting drafts into distinct sensory compartments.',
    objective: 'Walk the length of an open corridor or courtyard colonnade and note three distinct sensory threshold shifts.',
    clues: [
      'Feel the shift in ambient temperature as you transition from an enclosed hall into an open colonnade.',
      'Notice how your shoe tap sound reverberates: sharp echo in concrete versus deadened in grass borders.',
      'Catch sudden scent changes: smell of old library paper, rain-wetted red brick, or dining hall spice.'
    ],
    duration: 10,
    difficulty: 'Gentle',
    environments: ['campus', 'neighborhood', 'anywhere'],
    moods: ['observant', 'calm', 'curious'],
    safetyNotice: 'Be respectful of quiet zones on campus and yield space to fellow pedestrians.',
    reflectionPrompts: [
      'What was the sharpest sensory contrast across a single threshold step?',
      'How does architecture intentionally or unintentionally guide human emotional state?'
    ],
    followUpThemes: ['sensory geography', 'architectural transition', 'campus acoustics', 'threshold awareness'],
    semanticText: 'Campus Corridor Drift. Walking campus corridors and breezeways to observe sensory shifts in temperature, echo acoustics, and scents.'
  }
];

async function generate() {
  console.log(`Starting embedding generation for ${missionsData.length} missions...`);
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });

  const embeddedMissions = [];
  for (let i = 0; i < missionsData.length; i++) {
    const mission = missionsData[i];
    console.log(`[${i + 1}/${missionsData.length}] Embedding: ${mission.title}...`);
    const output = await extractor(mission.semanticText, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);
    embeddedMissions.push({
      ...mission,
      embedding
    });
  }

  const fileContent = `// Generated automatically by scripts/generate_missions.mjs
// Contains 36 curated, field-tested outdoor missions with pre-computed
// 384-dimensional normalized embeddings from Xenova/all-MiniLM-L6-v2 (Apache-2.0).

import { Mission } from '../types';

export const MISSIONS: Mission[] = ${JSON.stringify(embeddedMissions, null, 2)};

export const MISSION_MAP = new Map<string, Mission>(
  MISSIONS.map((m) => [m.id, m])
);
`;

  const outputPath = path.resolve('src/data/missions.ts');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`Successfully written ${embeddedMissions.length} missions to ${outputPath}`);
}

generate().catch(console.error);
