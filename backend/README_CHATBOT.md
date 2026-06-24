Chatbot integration notes

POST /api/chat
Body: { "message": string }
Response: { replyText: string, products?: ProductCard[] }

ProductCard fields: productID, name, image, price, stock, description

Optional: AI-powered replies
- Set `HUGGING_FACE_API_KEY` in backend `.env` to enable more natural chatbot replies using the Hugging Face Inference API (model: `facebook/blenderbot-400M-distill`).
	Example `.env` entry:
	HUGGING_FACE_API_KEY=hf_xxxYOURTOKENxxx
	If the key is not set, the chatbot falls back to concise programmatic replies.

