import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaRegPaperPlane } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { apiConnector } from '../services/apiConnector';
import { geminiai } from '../services/apis';

export default function GeminiAI() {
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedHistory = localStorage.getItem('chatHistory');
            if (savedHistory) {
                setChatHistory(JSON.parse(savedHistory));
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }
    }, [chatHistory]);

    const formatMessage = (text, isHTML = false) => {
        if (isHTML) {
            return <div dangerouslySetInnerHTML={{ __html: text }} />;
        }
        // Parse Markdown content
        return <ReactMarkdown>{text}</ReactMarkdown>;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput) return;

        const userMessage = { sender: "User", text: userInput };
        setChatHistory((prev) => [...prev, userMessage]);
        setUserInput("");

        try {
            const previousMessages = chatHistory.map(msg => msg.text).join("\n");
            const bodyData = {
                prompt: "Provide the response in well-structured Markdown format:\n" +
                    "Previous Responses By You: " + previousMessages + "\nMy New Query: " + userInput,
                output_format: "markdown"
            };
            const res = await apiConnector("POST", geminiai.GEMINI_AI_API, bodyData);

            if (res.status !== 200) {
                throw new Error(`Server error: ${res.statusText}`);
            }

            const botMessage = { sender: "Gemini AI", text: res.data.generatedText };
            setChatHistory((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Error:', error);
            toast.error("Something went wrong! Please try again.");
        }
    };

    const handleClearChat = () => {
        setChatHistory([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('chatHistory');
        }
    };

    return (
        <div
            style={{
                marginTop: '2rem',
                marginBottom: '2rem',
                margin: '2rem',
                backgroundColor: '#0c1a25',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '100%',
                width: '1000px',
                margin: 'auto'
            }}
        >
            <h1
                style={{
                    color: '#fff',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '2rem',
                    marginBottom: '1rem',
                }}
            >
                Gemini AI Chat
            </h1>
            <div
                ref={chatContainerRef}
                style={{
                    height: '60vh',
                    overflowY: 'auto',
                    padding: '1rem',
                    backgroundColor: '#1a2b3c',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    color: '#fff',
                }}
            >
                {chatHistory.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '0.5rem' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: msg.sender === "User" ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <div
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '5px',
                                    backgroundColor: msg.sender === "User" ? '#1976d2' : '#333',
                                    color: msg.sender === "User" ? 'white' : 'white',
                                    maxWidth: '70%',
                                }}
                            >
                                <p>{formatMessage(msg.text)}</p>
                                {msg.sender !== "User" && (
                                    <span style={{ color: '#757575', fontSize: '0.85rem' }}>
                                        {msg.sender}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        backgroundColor: '#333',
                        color: '#fff',
                        border: 'none',
                        // marginRight: '1rem',
                        marginBottom: '1rem',
                    }}
                />
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        width: '100%',
                        justifyContent: 'space-between',
                    }}
                >
                    <button
                        onClick={handleSubmit}
                        style={{
                            flex: '1 1 48%',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#1976d2',
                            color: '#fff',
                            borderRadius: '5px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <FaRegPaperPlane size={16} />
                        <span>Send</span>
                    </button>
                    <button
                        onClick={handleClearChat}
                        style={{
                            flex: '1 1 48%',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#555',
                            color: '#fff',
                            borderRadius: '5px',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Clear Chat
                    </button>
                </div>
            </div>
        </div>
    );
}
