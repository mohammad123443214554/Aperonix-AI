from flask import Flask, request, jsonify
from flask_cors import CORS
from ctransformers import AutoModelForCausalLM

app = Flask(__name__)
CORS(app) # Isse website ko access milega

# Aperonix AI Model Load karna
print("Aperonix AI Brain load ho raha hai...")
llm = AutoModelForCausalLM.from_pretrained(
    "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF", 
    model_file="tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf", 
    model_type="llama"
)

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    user_query = data.get("question")
    # AI se jawab mangna
    response = llm(user_query, max_new_tokens=150, temperature=0.7)
    return jsonify({"answer": response})

if __name__ == '__main__':
    print("Aperonix AI Server is running on port 5000")
    app.run(port=5000)
