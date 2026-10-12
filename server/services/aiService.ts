import { GoogleGenAI } from '@google/genai';
import { dbStore } from './dbStore.ts';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RecommendationRequest {
  message: string;
  history?: ChatMessage[];
  criteria?: {
    passengers?: number;
    suitcases?: number;
    pickupLocation?: string;
    returnLocation?: string;
    pickupDate?: string;
    returnDate?: string;
    maxDailyBudgetTnd?: number;
    category?: string;
    transmission?: 'Automatique' | 'Manuelle';
    withDriver?: boolean;
  };
  language?: 'fr' | 'en' | 'ar';
}

export interface RecommendedVehicleItem {
  vehicleId: string;
  brand: string;
  model: string;
  category: string;
  dailyRateTnd: number;
  image: string;
  seats: number;
  luggage: number;
  transmission: string;
  fuelType: string;
  reason: string;
  isAvailable: boolean;
}

export interface ChatResponse {
  reply: string;
  recommendations: RecommendedVehicleItem[];
  detectedCriteria: {
    passengers?: number;
    suitcases?: number;
    budget?: number;
    dates?: string;
    transmission?: string;
  };
  isAiPowered: boolean;
  modelUsed?: string;
}

export async function processChatRecommendation(
  reqData: RecommendationRequest
): Promise<ChatResponse> {
  const { message, history = [], language = 'fr' } = reqData;
  const userText = (message || '').toLowerCase();

  // 1. Fetch real active fleet from database
  const allVehicles = await dbStore.getVehicles({ status: 'available' });

  // 2. Extract heuristics from user prompt if criteria not explicitly structured
  const detectedPassengers =
    reqData.criteria?.passengers ||
    (userText.match(/(\d+)\s*(personnes|passagers|places|people|passengers)/i)?.[1]
      ? parseInt(userText.match(/(\d+)\s*(personnes|passagers|places|people|passengers)/i)![1], 10)
      : userText.includes('famille') || userText.includes('family')
      ? 5
      : userText.includes('seul') || userText.includes('couple')
      ? 2
      : undefined);

  const detectedSuitcases =
    reqData.criteria?.suitcases ||
    (userText.match(/(\d+)\s*(valises|bagages|suitcases|bags)/i)?.[1]
      ? parseInt(userText.match(/(\d+)\s*(valises|bagages|suitcases|bags)/i)![1], 10)
      : userText.includes('beaucoup de bagages') || userText.includes('grand coffre')
      ? 4
      : undefined);

  const detectedBudget =
    reqData.criteria?.maxDailyBudgetTnd ||
    (userText.match(/(\d+)\s*(dt|tnd|dinars|dinar|€|eur)/i)?.[1]
      ? parseInt(userText.match(/(\d+)\s*(dt|tnd|dinars|dinar|€|eur)/i)![1], 10)
      : userText.includes('économique') || userText.includes('pas cher') || userText.includes('cheap')
      ? 120
      : userText.includes('luxe') || userText.includes('prestige') || userText.includes('vip')
      ? 500
      : undefined);

  const requestedTransmission =
    reqData.criteria?.transmission ||
    (userText.includes('automatique') || userText.includes('automatic') || userText.includes('boite auto')
      ? 'Automatique'
      : userText.includes('manuelle') || userText.includes('manual')
      ? 'Manuelle'
      : undefined);

  const requestedCategory =
    reqData.criteria?.category ||
    (userText.includes('suv') || userText.includes('4x4')
      ? 'SUV & 4x4'
      : userText.includes('luxe') || userText.includes('prestige')
      ? 'Luxe & Prestige'
      : userText.includes('berline') || userText.includes('sedan')
      ? 'Berline Premium'
      : userText.includes('économique') || userText.includes('citadine')
      ? 'Économique'
      : undefined);

  // 3. Filter and rank candidate vehicles
  let candidateVehicles = allVehicles.filter((v) => {
    if (detectedPassengers && v.seats < detectedPassengers) return false;
    if (detectedSuitcases && v.luggage < detectedSuitcases) return false;
    if (requestedTransmission && v.transmission !== requestedTransmission) return false;
    if (requestedCategory && v.category !== requestedCategory) return false;
    if (detectedBudget && v.dailyRateTnd > detectedBudget * 1.25) return false;
    return true;
  });

  // If strict filtering returned zero, widen to all available fleet so user gets suggestions
  if (candidateVehicles.length === 0) {
    candidateVehicles = allVehicles;
  }

  // 4. Check date availability if dates provided
  let pickupDate: Date | null = null;
  let returnDate: Date | null = null;
  if (reqData.criteria?.pickupDate && reqData.criteria?.returnDate) {
    pickupDate = new Date(reqData.criteria.pickupDate);
    returnDate = new Date(reqData.criteria.returnDate);
  }

  const scoredCandidates: Array<{ vehicle: any; score: number; reason: string }> = [];

  for (const car of candidateVehicles) {
    let score = 50;
    let reason = '';

    // Availability verification
    let isAvailableForDates = true;
    if (pickupDate && returnDate) {
      const avail = await dbStore.checkVehicleAvailability(car._id, pickupDate, returnDate);
      isAvailableForDates = avail.available;
      if (!isAvailableForDates) score -= 40;
    }

    if (requestedCategory && car.category === requestedCategory) {
      score += 25;
      reason += `Correspond à la catégorie ${car.category}. `;
    }
    if (requestedTransmission && car.transmission === requestedTransmission) {
      score += 20;
      reason += `Transmission ${car.transmission}. `;
    }
    if (detectedPassengers && car.seats >= detectedPassengers) {
      score += 15;
      reason += `Accueille confortablement ${car.seats} passagers. `;
    }
    if (detectedSuitcases && car.luggage >= detectedSuitcases) {
      score += 15;
      reason += `Capacité de coffre (${car.luggage} valises). `;
    }
    if (detectedBudget && car.dailyRateTnd <= detectedBudget) {
      score += 20;
      reason += `Tarif de ${car.dailyRateTnd} TND/jour dans votre budget. `;
    } else if (car.isFeatured) {
      score += 10;
    }

    if (!reason) {
      reason = `Véhicule polyvalent (${car.seats} places, ${car.transmission}, ${car.dailyRateTnd} TND/jour).`;
    }

    scoredCandidates.push({
      vehicle: car,
      score,
      reason: reason.trim(),
    });
  }

  // Sort by score descending
  scoredCandidates.sort((a, b) => b.score - a.score);
  const topCandidates = scoredCandidates.slice(0, 3);

  const structuredRecs: RecommendedVehicleItem[] = topCandidates.map((item) => ({
    vehicleId: String(item.vehicle._id),
    brand: item.vehicle.brand,
    model: item.vehicle.model,
    category: item.vehicle.category,
    dailyRateTnd: item.vehicle.dailyRateTnd,
    image: item.vehicle.images?.[0] || '',
    seats: item.vehicle.seats,
    luggage: item.vehicle.luggage,
    transmission: item.vehicle.transmission,
    fuelType: item.vehicle.fuelType,
    reason: item.reason,
    isAvailable: item.vehicle.status === 'available',
  }));

  // 5. Check if GEMINI_API_KEY is available
  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = apiKey && !apiKey.includes('MY_GEMINI_API_KEY') && apiKey.length > 10;

  if (isKeyConfigured) {
    try {
      const ai = new GoogleGenAI();
      const catalogSummary = allVehicles
        .map(
          (c) =>
            `- ID: ${c._id} | ${c.brand} ${c.model} (${c.category}) | ${c.dailyRateTnd} TND/jour | ${c.seats} places | ${c.luggage} valises | Boîte ${c.transmission} | ${c.fuelType} | Statut: ${c.status}`
        )
        .join('\n');

      const systemPrompt = `Tu es "Crystal Assistant", le conseiller automobile d'élite de Crystal Rent Car, agence de location de voitures premium en Tunisie (Aéroports Tunis-Carthage, Enfidha, Monastir, Djerba, ainsi que Hammamet, Sousse et Tunis).

RÈGLES ABSOLUES:
1. Tu dois STRICTEMENT recommander des véhicules figurant dans l'inventaire réel ci-dessous. Ne fabrique JAMAIS de modèles, de prix ou de promotions qui ne sont pas dans cette liste.
2. Sois courtois, raffiné, professionnel et chaleureux.
3. Si la demande de l'utilisateur manque d'informations clés (ex: dates de séjour, nombre de personnes, point de prise en charge à l'aéroport ou hôtel), pose gentiment une question de précision tout en suggérant les meilleures options actuelles.
4. Réponds dans la langue de l'utilisateur (Français par défaut, Anglais si l'utilisateur parle anglais, Arabe tunisien si en arabe).
5. Mentionne les tarifs en Dinars Tunisiens (TND).

INVENTAIRE RÉEL ACTUEL EN BASE DE DONNÉES:
${catalogSummary}

RECOMMANDATIONS SÉLECTIONNÉES PAR LE SYSTÈME:
${JSON.stringify(structuredRecs, null, 2)}`;

      const conversationHistoryText = history
        .slice(-6)
        .map((h) => `${h.role === 'user' ? 'Client' : 'Crystal Assistant'}: ${h.content}`)
        .join('\n');

      const fullPrompt = `${conversationHistoryText ? conversationHistoryText + '\n' : ''}Client: ${message}\n\nCrystal Assistant:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${fullPrompt}` }] },
        ],
      });

      const replyText = response.text || '';
      if (replyText.trim().length > 0) {
        return {
          reply: replyText.trim(),
          recommendations: structuredRecs,
          detectedCriteria: {
            passengers: detectedPassengers,
            suitcases: detectedSuitcases,
            budget: detectedBudget,
            transmission: requestedTransmission,
          },
          isAiPowered: true,
          modelUsed: 'gemini-3.8-flash',
        };
      }
    } catch (aiError: any) {
      console.warn('Gemini API call failed, falling back to deterministic recommendations:', aiError?.message);
    }
  }

  // 6. Deterministic Fallback if Gemini key is missing or failed
  let fallbackReply = '';
  if (language === 'ar') {
    fallbackReply = `مرحباً بك في Crystal Rent Car تونس. بناءً على طلبك، قمت بمطابقة أفضل السيارات المتوفرة لدينا حالياً. يمكنك الاطلاع على التفاصيل وحجز سيارتك مباشرة. هل تود تحديد تواريخ الاستلام أو نقطة الوصول؟`;
  } else if (language === 'en') {
    fallbackReply = `Welcome to Crystal Rent Car Tunisia. Based on your request, I found our top available vehicles matching your criteria. You can view specifications and reserve directly. Would you like to specify exact pickup dates or airport location?`;
  } else {
    fallbackReply = `Bonjour et bienvenue chez Crystal Rent Car Tunisie. J'ai analysé notre flotte en temps réel et sélectionné les véhicules les plus adaptés à vos critères. Vous pouvez consulter les détails et réserver en ligne dès maintenant. Souhaitez-vous préciser vos dates de location ou votre lieu de prise en charge (Aéroport Tunis-Carthage, Enfidha, etc.) ?`;
  }

  return {
    reply: fallbackReply,
    recommendations: structuredRecs,
    detectedCriteria: {
      passengers: detectedPassengers,
      suitcases: detectedSuitcases,
      budget: detectedBudget,
      transmission: requestedTransmission,
    },
    isAiPowered: false,
  };
}
