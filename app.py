from flask import Flask, render_template, request, jsonify
from groq import Groq
from datetime import datetime

app = Flask(__name__)

client = Groq(
    api_key="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"
)

messages = [
    {
        "role": "system",
        "content": "You are a helpful AI assistant."
    }
]

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        user_message = data["message"]

        # Local date/time support
        if "time" in user_message.lower() or "date" in user_message.lower():

            now = datetime.now()

            return jsonify({
                "response":
                f"Current date and time: {now.strftime('%d %B %Y, %I:%M:%S %p')}"
            })

        messages.append({
            "role": "user",
            "content": user_message
        })

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages
        )

        bot_reply = response.choices[0].message.content

        messages.append({
            "role": "assistant",
            "content": bot_reply
        })

        return jsonify({
            "response": bot_reply
        })

    except Exception as e:

        return jsonify({
            "response": f"ERROR: {str(e)}"
        })


if __name__ == "__main__":
    app.run(debug=True)