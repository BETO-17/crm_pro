from google import genai
from app.core.config import settings
import json

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = 'gemini-3.6-flash'

    def generate_sql_and_analysis(self, table_name: str, schema: str, question: str):
        prompt = f"""
You are an expert data analyst and SQL assistant. 
You are given a PostgreSQL database table schema on Supabase.
Table Name: {table_name}
Schema:
{schema}

User Question: {question}

Generate two things:
1. A valid PostgreSQL query to answer the user's question using the provided table schema.
2. A natural language explanation of what the query does or a preliminary analysis based on the question.

Return the response STRICTLY as a JSON object with two keys:
"sql": the raw SQL query string. Do not include markdown code block syntax (like ```sql).
"explanation": the natural language explanation.

Respond only with the JSON object.
"""
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
        )
        try:
            content = response.text.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            
            return json.loads(content.strip())
        except Exception as e:
            return {
                "sql": None,
                "explanation": f"Error conectando con Gemini: {str(e)}"
            }
            
    def compare_datasets(self, table_a: str, schema_a: str, summary_a: dict, table_b: str, schema_b: str, summary_b: dict, question: str = ""):
        prompt = f"""
You are an executive data analyst specializing in retail and business metrics comparisons (pricing, expenses, margins, inventory, trends).
Table A: {table_a}
Schema A: {schema_a}
Summary Stats A: {json.dumps(summary_a, default=str)}

Table B: {table_b}
Schema B: {schema_b}
Summary Stats B: {json.dumps(summary_b, default=str)}

User Question / Context: {question or "Compare the two datasets focusing on prices, expenses, discounts/offers and key metrics."}

Provide a concise, professional comparative analysis in Spanish highlighting:
1. Key differences in pricing, costs or discounts.
2. Volume and distribution insights.
3. Actionable recommendation.
Keep it under 3-4 short paragraphs with bullet points, executive tone.
"""
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            return response.text.strip()
        except Exception as e:
            return f"Error generando comparativa con Gemini: {str(e)}"

gemini_service = GeminiService()
