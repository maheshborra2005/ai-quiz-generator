from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

@app.route("/generate", methods=["POST"])
def generate_mcq():
    try:
        data = request.get_json()
        topic = data.get("topic", "")

        prompt = f"""
        Generate 7 MCQ questions on the topic: {topic}.

        Return ONLY valid JSON.
        Format:

        [
          {{
            "question": "Question text",
            "options": ["A", "B", "C", "D"],
            "answer_index": 0
          }}
        ]

        answer_index must be 0,1,2 or 3.
        No explanation.
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        text = response.text.strip()

        # Extract JSON safely
        start = text.find("[")
        end = text.rfind("]") + 1
        json_text = text[start:end]

        questions = json.loads(json_text)

        return jsonify({"questions": questions})

    except Exception as e:
        print("BACKEND ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run()
