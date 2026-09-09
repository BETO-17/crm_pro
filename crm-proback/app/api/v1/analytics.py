from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, engine
from app.services.gemini_service import gemini_service
import pandas as pd

router = APIRouter()

class ChatRequest(BaseModel):
    table_name: str
    question: str

class CompareRequest(BaseModel):
    table_a: str
    table_b: str
    focus: str = "general"
    question: str = ""

def get_table_schema_and_stats(table_name: str):
    schema_str = ""
    summary = {}
    with engine.connect() as conn:
        col_query = text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table_name}'")
        col_res = conn.execute(col_query).fetchall()
        if not col_res:
            return None, None
        
        schema_str = "\n".join([f"- {row[0]} ({row[1]})" for row in col_res])
        
        try:
            count_res = conn.execute(text(f'SELECT count(*) FROM "{table_name}"')).scalar()
            summary["total_rows"] = count_res
        except Exception:
            summary["total_rows"] = 0
            
        # Fast single query on first 3 numeric cols (excluding id)
        numeric_cols = [r[0] for r in col_res if any(t in str(r[1]).lower() for t in ['int', 'float', 'double', 'numeric', 'real']) and r[0] != 'id'][:3]
        col_stats = {}
        if numeric_cols:
            select_parts = []
            for ncol in numeric_cols:
                select_parts.append(f'AVG("{ncol}"), MIN("{ncol}"), MAX("{ncol}")')
            try:
                stat_query = text(f'SELECT {", ".join(select_parts)} FROM "{table_name}"')
                row = conn.execute(stat_query).fetchone()
                if row:
                    for i, ncol in enumerate(numeric_cols):
                        if row[i*3] is not None:
                            col_stats[ncol] = {
                                "avg": round(float(row[i*3]), 2),
                                "min": round(float(row[i*3+1]), 2),
                                "max": round(float(row[i*3+2]), 2),
                            }
            except Exception:
                pass
        summary["numeric_aggregates"] = col_stats
        
    return schema_str, summary

@router.post("/chat")
def chat_with_dataset(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    try:
        # Get schema from PostgreSQL
        with engine.connect() as conn:
            query = text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{request.table_name}'")
            result = conn.execute(query)
            schema = "\\n".join([f"- {row[0]} ({row[1]})" for row in result])
            
            if not schema:
                raise HTTPException(status_code=404, detail="Table not found")
                
        # Ask Gemini
        ai_response = gemini_service.generate_sql_and_analysis(
            table_name=request.table_name,
            schema=schema,
            question=request.question
        )
        
        sql_query = ai_response.get("sql")
        explanation = ai_response.get("explanation")
        
        data = []
        if sql_query:
            with engine.connect() as conn:
                try:
                    df = pd.read_sql(sql_query, conn)
                    df = df.fillna(0)
                    data = df.to_dict(orient="records")
                except Exception as e:
                    explanation += f"\\n\\n[Error executing query: {str(e)}]"
        
        return {
            "sql": sql_query,
            "explanation": explanation,
            "data": data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compare")
def compare_two_datasets(
    request: CompareRequest,
    db: Session = Depends(get_db)
):
    try:
        schema_a, summary_a = get_table_schema_and_stats(request.table_a)
        if not schema_a:
            raise HTTPException(status_code=404, detail=f"Tabla '{request.table_a}' no encontrada en la base de datos.")
            
        schema_b, summary_b = get_table_schema_and_stats(request.table_b)
        if not schema_b:
            raise HTTPException(status_code=404, detail=f"Tabla '{request.table_b}' no encontrada en la base de datos.")

        user_prompt = request.question
        if not user_prompt:
            if request.focus == "precios":
                user_prompt = "Compara las estrategias de precios y diferencias de precio unitario/base entre ambas tablas."
            elif request.focus == "ventas":
                user_prompt = "Compara el volumen de ventas, cantidad de transacciones y facturación entre ambas tablas."
            elif request.focus == "ofertas":
                user_prompt = "Compara las promociones, porcentajes de descuento y agresividad de ofertas entre ambas tablas."
            elif request.focus == "estrategias":
                user_prompt = "Analiza las ventajas competitivas, margen, costos y recomendaciones estratégicas basadas en ambas tablas."
            else:
                user_prompt = "Realiza un análisis comparativo integral destacando precios, ventas, ofertas y recomendaciones comerciales."

        ai_analysis = gemini_service.compare_datasets(
            table_a=request.table_a,
            schema_a=schema_a,
            summary_a=summary_a,
            table_b=request.table_b,
            schema_b=schema_b,
            summary_b=summary_b,
            question=user_prompt
        )

        return {
            "table_a": request.table_a,
            "table_b": request.table_b,
            "summary_a": summary_a,
            "summary_b": summary_b,
            "focus": request.focus,
            "ai_analysis": ai_analysis
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en comparación de datasets: {str(e)}")

