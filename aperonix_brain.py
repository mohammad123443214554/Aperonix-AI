from ctransformers import AutoModelForCausalLM

print("--------------------------------------------------")
print("🚀 Aperonix AI Brain is Loading... Please Wait.")
print("--------------------------------------------------")

try:
    # Ye line real AI model download aur load karegi
    llm = AutoModelForCausalLM.from_checkpoint(
        "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF", 
        model_file="tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf", 
        model_type="llama"
    )

    print("\n✅ Aperonix AI is now ONLINE!")
    print("Bhai, kuch bhi pucho (Type 'exit' to stop)\n")

    while True:
        user_input = input("Aap: ")
        if user_input.lower() == 'exit':
            print("Aperonix AI: Alvida bhai! Phir milenge.")
            break

        # AI Response Generation
        response = llm(user_input, max_new_tokens=150, temperature=0.7)
        print(f"\nAperonix AI: {response}")

except Exception as e:
    print(f"Bhai, error aa gaya: {e}")
