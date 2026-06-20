const Trip = require('../models/Trip');

// ─── Exponential Backoff for Gemini API ───────────────────────────────────────
async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if ((response.status === 429 || response.status === 503) && retries > 0) {
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      const errorText = await response.text();
      throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0 && error.code === 'ECONNRESET') {
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

// ─── Normalize timeOfDay ──────────────────────────────────────────────────────
function normalizeTimeOfDay(time) {
  if (!time) return 'Morning';
  const t = time.toLowerCase();
  if (t.includes('morning')) return 'Morning';
  if (t.includes('afternoon') || t.includes('lunch') || t.includes('midday')) return 'Afternoon';
  if (t.includes('evening') || t.includes('night') || t.includes('dusk') || t.includes('late')) return 'Evening';
  return 'Morning';
}

// ─── Normalize packingList category ──────────────────────────────────────────
function normalizeCategory(category) {
  if (!category) return 'Other';
  const c = category.toLowerCase();
  if (c.includes('document') || c.includes('passport') || c.includes('visa')) return 'Documents';
  if (c.includes('cloth') || c.includes('wear') || c.includes('apparel') || c.includes('fashion')) return 'Clothing';
  if (c.includes('gear') || c.includes('equipment') || c.includes('tech') || c.includes('electronic') || c.includes('gadget')) return 'Gear';
  if (c.includes('toiletri') || c.includes('hygiene') || c.includes('beauty') || c.includes('accessori') || c.includes('cosmetic') || c.includes('personal')) return 'Toiletries';
  return 'Other';
}

// ─── Normalize hotel tier ─────────────────────────────────────────────────────
function normalizeHotelTier(tier) {
  if (!tier) return 'Mid-Range';
  const t = tier.toLowerCase();
  if (t.includes('budget') || t.includes('cheap') || t.includes('economy') || t.includes('hostel')) return 'Budget';
  if (t.includes('luxury') || t.includes('premium') || t.includes('5 star') || t.includes('five star')) return 'Luxury';
  return 'Mid-Range';
}

// ─── Build Gemini Prompt ──────────────────────────────────────────────────────
function buildItineraryPrompt(destination, durationDays, budgetTier, interests, startDate) {
  const budgetGuidance = {
    Low: 'budget-friendly, hostels, street food, free attractions',
    Medium: 'mid-range hotels, local restaurants, mix of paid and free activities',
    High: 'luxury hotels, fine dining, premium experiences and private tours',
  };

  return `
You are an expert travel planner. Create a detailed ${durationDays}-day travel itinerary for ${destination}.

Trip Details:
- Duration: ${durationDays} days
- Budget Level: ${budgetTier} (${budgetGuidance[budgetTier]})
- Interests: ${interests.join(', ')}
- Start Date: ${startDate || 'flexible'}

Return ONLY a valid JSON object with NO markdown, NO explanation, just raw JSON matching this EXACT structure:

{
  "itinerary": [
    {
      "dayNumber": 1,
      "theme": "Arrival & City Exploration",
      "activities": [
        {
          "title": "Visit Senso-ji Temple",
          "description": "Explore Tokyo oldest and most iconic temple in Asakusa district",
          "estimatedCostUSD": 0,
          "timeOfDay": "Morning"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "Budget Hotel Name",
      "tier": "Budget",
      "estimatedCostNightUSD": 50,
      "rating": "4.2/5",
      "highlights": "Central location, free breakfast",
      "location": "City center area"
    },
    {
      "name": "Mid-Range Hotel Name",
      "tier": "Mid-Range",
      "estimatedCostNightUSD": 120,
      "rating": "4.5/5",
      "highlights": "Rooftop pool, spa, great views",
      "location": "Near main attractions"
    },
    {
      "name": "Luxury Hotel Name",
      "tier": "Luxury",
      "estimatedCostNightUSD": 300,
      "rating": "4.9/5",
      "highlights": "Butler service, Michelin dining, premium suites",
      "location": "Prime district"
    }
  ],
  "estimatedBudget": {
    "flights": 500,
    "accommodation": 400,
    "food": 200,
    "activities": 150,
    "miscellaneous": 100,
    "total": 1350
  },
  "packingList": [
    { "item": "Passport", "category": "Documents", "isPacked": false, "essential": true },
    { "item": "Travel Insurance Documents", "category": "Documents", "isPacked": false, "essential": true },
    { "item": "Comfortable Walking Shoes", "category": "Clothing", "isPacked": false, "essential": true },
    { "item": "Weather-appropriate clothing", "category": "Clothing", "isPacked": false, "essential": true },
    { "item": "Universal Power Adapter", "category": "Gear", "isPacked": false, "essential": false },
    { "item": "Portable Charger", "category": "Gear", "isPacked": false, "essential": false },
    { "item": "Sunscreen SPF 50+", "category": "Toiletries", "isPacked": false, "essential": false }
  ],
  "travelTips": [
    "Book major attractions in advance to avoid queues",
    "Download offline maps before arrival",
    "Learn a few basic phrases in the local language"
  ],
  "weatherSummary": "Brief description of typical weather at destination during travel period"
}

STRICT Rules - follow exactly:
- Generate exactly ${durationDays} days in itinerary array
- Each day must have 3-5 activities
- timeOfDay must be ONLY one of: "Morning" or "Afternoon" or "Evening" — no other values like Night, Late Afternoon etc
- hotel tier must be ONLY one of: "Budget" or "Mid-Range" or "Luxury"
- packingList category must be ONLY one of: "Documents" or "Clothing" or "Gear" or "Toiletries" or "Other"
- Budget estimates must be REALISTIC for ${budgetTier} tier in ${destination}
- Include exactly 3 hotels: one Budget, one Mid-Range, one Luxury
- Include 5-7 packing items and 4-6 travel tips
- Return ONLY raw JSON, no markdown, no explanation
`;
}

// ─── Build Day Regeneration Prompt ───────────────────────────────────────────
function buildRegenerateDayPrompt(destination, dayNumber, durationDays, budgetTier, interests, userRequest) {
  return `
You are an expert travel planner. Regenerate Day ${dayNumber} of a ${durationDays}-day trip to ${destination}.

Context:
- Budget Level: ${budgetTier}
- Interests: ${interests.join(', ')}
- User Request: "${userRequest || `Fresh activities for Day ${dayNumber}`}"

Return ONLY a valid JSON object:
{
  "dayNumber": ${dayNumber},
  "theme": "Theme for this day",
  "activities": [
    {
      "title": "Activity Title",
      "description": "Detailed description of the activity",
      "estimatedCostUSD": 25,
      "timeOfDay": "Morning"
    }
  ]
}

STRICT Rules:
- Generate 3-5 activities
- Honor the user request: "${userRequest}"
- All activities must be in or near ${destination}
- Costs must match ${budgetTier} budget level
- timeOfDay must be ONLY one of: "Morning" or "Afternoon" or "Evening"
- Return ONLY raw JSON, no markdown
`;
}

// ─── Call Gemini API ──────────────────────────────────────────────────────────
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  };

  const data = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');

  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(clean);
}

// ─── Sanitize all AI data before saving ──────────────────────────────────────
function sanitizeAIResult(aiResult) {
  // Normalize itinerary timeOfDay
  if (aiResult.itinerary) {
    aiResult.itinerary = aiResult.itinerary.map((day) => ({
      ...day,
      activities: (day.activities || []).map((act) => ({
        ...act,
        timeOfDay: normalizeTimeOfDay(act.timeOfDay),
        estimatedCostUSD: Number(act.estimatedCostUSD) || 0,
      })),
    }));
  }

  // Normalize packingList category
  if (aiResult.packingList) {
    aiResult.packingList = aiResult.packingList.map((item) => ({
      ...item,
      category: normalizeCategory(item.category),
      isPacked: false,
      essential: item.essential || false,
    }));
  }

  // Normalize hotel tier
  if (aiResult.hotels) {
    aiResult.hotels = aiResult.hotels.map((hotel) => ({
      ...hotel,
      tier: normalizeHotelTier(hotel.tier),
      estimatedCostNightUSD: Number(hotel.estimatedCostNightUSD) || 0,
    }));
  }

  return aiResult;
}

// ─── Controllers ──────────────────────────────────────────────────────────────

// @route   POST /api/trips
exports.generateTrip = async (req, res) => {
  try {
    const { destination, durationDays, budgetTier, interests, startDate } = req.body;
    const userId = req.user.id;

    if (!destination || !durationDays || !budgetTier || !interests?.length) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const prompt = buildItineraryPrompt(destination, durationDays, budgetTier, interests, startDate);
    let aiResult = await callGemini(prompt);

    // Sanitize all AI data before saving
    aiResult = sanitizeAIResult(aiResult);

    const trip = await Trip.create({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests,
      startDate: startDate || '',
      itinerary: aiResult.itinerary,
      hotels: aiResult.hotels,
      estimatedBudget: aiResult.estimatedBudget,
      packingList: aiResult.packingList,
      travelTips: aiResult.travelTips || [],
      weatherSummary: aiResult.weatherSummary || '',
      status: 'ready',
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Generate Trip Error:', error);
    res.status(500).json({ message: 'Failed to generate itinerary. Please try again.', error: error.message });
  }
};

// @route   GET /api/trips
exports.getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('destination durationDays budgetTier interests estimatedBudget status createdAt');
    res.json(trips);
  } catch (error) {
    console.error('Get Trips Error:', error);
    res.status(500).json({ message: 'Failed to fetch trips.' });
  }
};

// @route   GET /api/trips/:id
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    res.json(trip);
  } catch (error) {
    console.error('Get Trip Error:', error);
    res.status(500).json({ message: 'Failed to fetch trip.' });
  }
};

// @route   PUT /api/trips/:id
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    const allowedFields = ['itinerary', 'packingList', 'travelTips', 'hotels'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) trip[field] = req.body[field];
    });

    await trip.save();
    res.json(trip);
  } catch (error) {
    console.error('Update Trip Error:', error);
    res.status(500).json({ message: 'Failed to update trip.' });
  }
};

// @route   POST /api/trips/:id/regenerate-day
exports.regenerateDay = async (req, res) => {
  try {
    const { dayNumber, userRequest } = req.body;
    if (!dayNumber) return res.status(400).json({ message: 'Day number is required.' });

    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    const prompt = buildRegenerateDayPrompt(
      trip.destination, dayNumber, trip.durationDays,
      trip.budgetTier, trip.interests, userRequest
    );

    const newDay = await callGemini(prompt);

    // Normalize regenerated day activities
    if (newDay.activities) {
      newDay.activities = newDay.activities.map((act) => ({
        ...act,
        timeOfDay: normalizeTimeOfDay(act.timeOfDay),
        estimatedCostUSD: Number(act.estimatedCostUSD) || 0,
      }));
    }

    trip.itinerary = trip.itinerary.map((day) =>
      day.dayNumber === dayNumber ? { ...day.toObject(), ...newDay } : day
    );

    await trip.save();
    res.json(trip);
  } catch (error) {
    console.error('Regenerate Day Error:', error);
    res.status(500).json({ message: 'Failed to regenerate day.' });
  }
};

// @route   DELETE /api/trips/:id
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    res.json({ message: 'Trip deleted successfully.' });
  } catch (error) {
    console.error('Delete Trip Error:', error);
    res.status(500).json({ message: 'Failed to delete trip.' });
  }
};

// @route   POST /api/trips/:id/add-activity
exports.addActivity = async (req, res) => {
  try {
    const { dayNumber, title, description, timeOfDay, estimatedCostUSD } = req.body;
    if (!dayNumber || !title) {
      return res.status(400).json({ message: 'Day number and title are required.' });
    }

    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    const dayIndex = trip.itinerary.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return res.status(404).json({ message: 'Day not found.' });

    trip.itinerary[dayIndex].activities.push({
      title,
      description: description || '',
      timeOfDay: normalizeTimeOfDay(timeOfDay),
      estimatedCostUSD: Number(estimatedCostUSD) || 0,
    });

    await trip.save();
    res.json(trip);
  } catch (error) {
    console.error('Add Activity Error:', error);
    res.status(500).json({ message: 'Failed to add activity.' });
  }
};

// @route   DELETE /api/trips/:id/remove-activity
exports.removeActivity = async (req, res) => {
  try {
    const { dayNumber, activityId } = req.body;

    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    const dayIndex = trip.itinerary.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return res.status(404).json({ message: 'Day not found.' });

    trip.itinerary[dayIndex].activities = trip.itinerary[dayIndex].activities.filter(
      (a) => a._id.toString() !== activityId
    );

    await trip.save();
    res.json(trip);
  } catch (error) {
    console.error('Remove Activity Error:', error);
    res.status(500).json({ message: 'Failed to remove activity.' });
  }
};