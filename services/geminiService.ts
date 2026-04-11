
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, InventoryItem, UserProfile } from "../types";
import { FOOD_METRICS } from "../constants";

export const generateRescueRecipes = async (
  mandatoryIngredients: InventoryItem[],
  userProfile: UserProfile
): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview"; 
  
  let totalPotentialSavedGbp = 0;
  let totalPotentialCo2Saved = 0;
  mandatoryIngredients.forEach(ing => {
    const data = FOOD_METRICS[ing.item_key];
    if (data) {
      totalPotentialSavedGbp += data.price_gbp;
      totalPotentialCo2Saved += data.co2_kg;
    }
  });

  const systemInstruction = `You are the EcoPulse Kitchen Engine. Your goal is to reboot the user's food supply chain.
You act as a Resource Optimizer, transforming reactive kitchens into predictive nodes.

Core Logic:
1. Mandatory Ingredients: You MUST use ALL items provided in the mandatory list. These are at high waste risk.
2. Safety Guard: Strictly adhere to Allergy_Profile and Dietary_Preference. 
3. Missing Links: Identify exactly what is missing to complete a high-quality "Rescue Meal".
4. Bragging Rights: In the 'description' field, explain how this meal saves money (£) and reduces CO2 based on the provided impact context. Use a tone of "Systems Reboot" and "Predictive Efficiency".

Constraints:
- Return exactly 3 recipes in a valid JSON array.
- Missing links must also respect the safety profile.
- All nutritional values must be realistic.`;

  const inputContext = {
    mandatory_ingredients: mandatoryIngredients.map(i => ({
      name: i.name,
      risk_score: i.risk_score,
      item_key: i.item_key
    })),
    user_profile: {
      allergies: userProfile.allergies,
      dietary: userProfile.dietary_preferences
    },
    impact_context: {
      total_gbp_value: totalPotentialSavedGbp.toFixed(2),
      total_co2_potential_kg: totalPotentialCo2Saved.toFixed(2)
    }
  };

  const response = await ai.models.generateContent({
    model,
    contents: `Generate 3 Rescue Recipes for these assets: ${JSON.stringify(inputContext)}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            recipe_name: { type: Type.STRING },
            description: { type: Type.STRING, description: "A brag about £ saved and CO2 reduced." },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.STRING },
                carbs: { type: Type.STRING },
                fat: { type: Type.STRING },
              },
              required: ["calories", "protein", "carbs", "fat"],
            },
            missing_ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            safety_confirmation: { type: Type.STRING, description: "Acknowledge the specific allergy check." },
          },
          required: ["recipe_name", "description", "instructions", "nutrition", "missing_ingredients", "safety_confirmation"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("EcoPulse Engine failed to return a response.");
  
  const parsedRecipes: any[] = JSON.parse(text);
  
  return parsedRecipes.map(recipe => {
    let missingCost = 0;
    recipe.missing_ingredients.forEach((ing: string) => {
      const key = Object.keys(FOOD_METRICS).find(k => 
        ing.toLowerCase().includes(k.replace(/_/g, ' ')) || 
        k.replace(/_/g, ' ').includes(ing.toLowerCase())
      );
      if (key) {
        missingCost += FOOD_METRICS[key].price_gbp;
      } else {
        missingCost += 1.25; 
      }
    });

    return {
      ...recipe,
      missing_ingredients_cost_gbp: Number(missingCost.toFixed(2)),
      impact: {
        gbp_saved: Number(totalPotentialSavedGbp.toFixed(2)),
        co2_saved_kg: Number(totalPotentialCo2Saved.toFixed(2)),
      }
    };
  });
};

export const searchRecipesByPantry = async (
  ingredients: string[],
  userProfile: UserProfile
): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";

  const systemInstruction = `You are the EcoPulse Pantry Finder. Your goal is to suggest high-quality meals based on the ingredients provided by the user.

Core Logic:
1. Primary Ingredients: Focus on using the ingredients the user has provided. 
2. Safety Guard: Strictly adhere to Allergy_Profile and Dietary_Preference. 
3. Efficiency: Suggest recipes that are practical and minimize the need for additional shopping.
4. Tone: Helpful, efficient, and systems-oriented.

Constraints:
- Return exactly 3 recipes in a valid JSON array.
- Nutritious and realistic.
- Include a safety confirmation.`;

  const inputContext = {
    pantry_items: ingredients,
    user_profile: {
      allergies: userProfile.allergies,
      dietary: userProfile.dietary_preferences
    }
  };

  const response = await ai.models.generateContent({
    model,
    contents: `Find 3 meals for these pantry items: ${JSON.stringify(inputContext)}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            recipe_name: { type: Type.STRING },
            description: { type: Type.STRING, description: "Brief culinary summary." },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.STRING },
                carbs: { type: Type.STRING },
                fat: { type: Type.STRING },
              },
              required: ["calories", "protein", "carbs", "fat"],
            },
            missing_ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            safety_confirmation: { type: Type.STRING },
          },
          required: ["recipe_name", "description", "instructions", "nutrition", "missing_ingredients", "safety_confirmation"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Pantry Finder Engine failed.");
  
  const parsedRecipes: any[] = JSON.parse(text);
  
  return parsedRecipes.map(recipe => ({
    ...recipe,
    missing_ingredients_cost_gbp: recipe.missing_ingredients.length * 1.5, // Estimation
    impact: {
      gbp_saved: 0,
      co2_saved_kg: 0,
    }
  }));
};
