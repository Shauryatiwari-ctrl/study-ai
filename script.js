const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const actionButtons = document.querySelectorAll(".action-btn");

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;

// **IMPORTANT: Get your free API key from https://aistudio.google.com/app/apikey**
const API_KEY = ""; // Replace with your Gemini API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" 
        ? `<p></p>` 
        : `<span class="material-symbols-outlined">psychology</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
};

const generateResponse = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");
    
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                role: "user",
                parts: [{ text: `You are an AI study helper for a 15-year-old CBSE Class 10 student in India. Help with subjects like Math, Physics, Chemistry, Biology, Social Studies, and Computer Science. Explain concepts clearly and encourage learning. Question: ${userMessage}` }]
            }]
        }),
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error.message);
        
        // Format the response
        messageElement.textContent = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, '$1'); // Remove markdown bold
    } catch (error) {
        messageElement.classList.add("error");
        messageElement.textContent = error.message === "Failed to fetch" 
            ? "⚠️ Please add your API key in script.js to use this feature!" 
            : error.message;
    } finally {
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
};

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
};

// Quick action buttons
actionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        chatInput.value = btn.dataset.prompt + " ";
        chatInput.focus();
    });
});

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
