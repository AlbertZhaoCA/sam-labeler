import ast
import os
from groq import Groq
import dotenv

dotenv.load_dotenv()

client = Groq(
    api_key=os.environ.get("Groq_Key"),
)

def generate_props(input: str) -> None|dict:
    result = None
    attempts = 0
    max_attempts = 3

    while attempts < max_attempts:
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI agent that generates parameters for Stable Diffusion inpainting tasks. When given a description, output only the parameters in the following format:"
                                   " { 'prompt': <string>, 'negative_prompt': <string>, 'num_inference_steps': <int>, 'guidance_scale': <float>, 'strength': <float> } The prompt filed is in the form of"
                                   " a comma-separated list of visual elements, without any additional explanation or text. When given a description, only describe the object to be generated or inpainted,"
                                   " and exclude any reference to the original object. For example: 'young boy, casual clothes."
                    },
                    {
                        "role": "user",
                        "content": input,
                    }
                ],
                model="llama3-8b-8192",
            )
            result = chat_completion.choices[0].message.content
            result = ast.literal_eval(result)
            print(result)
            result = None
            break

        except Exception as e:
            attempts += 1
            print("error", str(e), "retrying", attempts)

    return result
