import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaRegPaperPlane, FaRegCopy } from 'react-icons/fa';

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

    const formatMessage = (text) => {
        const messageText = typeof text === 'string' ? text : '';
        const regex = /```(.*?)```/gs;

        return messageText.split(regex).map((part, index) =>
            index % 2 === 1 ? (
                <div key={index} style={{ position: 'relative', marginBottom: '1rem', backgroundColor: '#333', padding: '0.5rem', borderRadius: '5px' }}>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                        <code>{part}</code>
                    </pre>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(part);
                            toast.success("Copied Successfully");
                        }}
                        style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            padding: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        <FaRegCopy size={16} />
                    </button>
                </div>
            ) : (
                <span key={index}>{part}</span>
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput) return;

        const userMessage = { sender: "User", text: userInput };
        setChatHistory((prev) => [...prev, userMessage]);
        setUserInput("");

        try {
            const previousMessages = chatHistory.map(msg => msg.text).join("\n");
            const res = await fetch('/api/generate-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: "Previous Responses By You: " + previousMessages + "\nMy New Query: " + userInput
                }),
            });

            if (!res.ok) {
                throw new Error(`Server error: ${res.statusText}`);
            }

            const data = await res.json();
            const botMessage = { sender: "Gemini AI", text: data.generatedText };
            setChatHistory((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleClearChat = () => {
        setChatHistory([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('chatHistory');
        }
    };

    return (
        <div style={{ marginTop: '2rem', marginBottom: '2rem',margin:'2rem', backgroundColor: '#0c1a25', padding: '2rem', borderRadius: '8px' }}>
            <h1 style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: '2rem', marginBottom: '1rem' }}>
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
                    color: '#fff'
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
            <div style={{ marginTop: '1rem' }}>
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        width: '80%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        backgroundColor: '#333',
                        color: '#fff',
                        border: 'none',
                        marginRight: '1rem'
                    }}
                />
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        borderRadius: '5px',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <FaRegPaperPlane size={16} />
                </button>
                <button
                    onClick={handleClearChat}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#555',
                        color: '#fff',
                        borderRadius: '5px',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: '1rem'
                    }}
                >
                    Clear
                </button>
            </div>
        </div>
    );
}
