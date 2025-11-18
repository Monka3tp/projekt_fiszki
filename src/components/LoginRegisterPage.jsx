// javascript
// File: `src/components/LoginRegisterPage.jsx`
import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "../App.css";
import "./LoginRegisterPage.css";

import { auth } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";

function LoginForm({
    email,
    setEmail,
    password,
    setPassword,
    onSubmit,
    loading,
    message,
    messageType,
}) {

    return (
        <div className="login-register-container">
            {message !== "" && (<div className={`alert alert-${messageType}`} role="alert">{message}</div>)}
            <h1>Zaloguj się</h1>
            <p className="login-register-subtitle">Witaj ponownie w BrainDeck</p>

            <form className="login-register-form" onSubmit={onSubmit}>
                <label htmlFor="email">Adres e-mail</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Wpisz e-mail"
                    required
                />

                <label htmlFor="password">Hasło</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Wpisz hasło"
                    required
                />

                <button type="submit" className="btn-primary full-width" disabled={loading}>
                    {loading ? "Ładowanie..." : "Zaloguj się"}
                </button>
            </form>

            <p className="login-register-footer">
                Nie masz konta? <Link to={"/register"} className={"link"}>Zarejestruj się</Link>
            </p>
        </div>
    );
}

function RegisterForm({
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    onSubmit,
    loading,
    message,
    messageType,
}) {

    return (
        <div className="login-register-container">
            {message !== "" && (<div className={`alert alert-${messageType}`} role="alert">{message}</div>)}
            <h1>Zarejestruj się</h1>
            <p className="login-register-subtitle">Witaj w BrainDeck</p>

            <form className="login-register-form" onSubmit={onSubmit}>
                <label htmlFor="displayName">Nazwa</label>
                <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Twoja nazwa (opcjonalnie)"
                />

                <label htmlFor="email">Adres e-mail</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Wpisz e-mail"
                    required
                />

                <label htmlFor="password">Hasło</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Wpisz hasło"
                    required
                />

                <button type="submit" className="btn-primary full-width" disabled={loading}>
                    {loading ? "Tworzenie..." : "Zarejestruj się"}
                </button>
            </form>

            <p className="login-register-footer">
                Masz już konto? <Link to={"/login"} className={"link"}>Zaloguj się</Link>
            </p>
        </div>
    );
}

export default function LoginRegisterPage() {
    const location = useLocation();
    const path = location.pathname || "";
    const isRegister = path.endsWith("/register");

    const navigate = useNavigate();

    const [destination, setDestination] = useState(location.state?.from || "/");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(location.state?.message || "");
    const [messageType, setMessageType] = useState(location.state?.messageType || "info");

    useEffect(() => {
        setMessage("");
        setLoading(false);
        setEmail("");
        setPassword("");
        setDisplayName("");
    }, [path]);

    useEffect(() => {
        if (message) {
            navigate(location.pathname, {replace: true, state: {}});
        }
    }, [navigate, location.pathname, message]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate(destination);
        } catch (err) {
            setMessage(err.message || "Błąd logowania");
            setMessageType("error");
            setLoading(false);
        }
    };

    const identifyError = (error) => {
        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                    return { message: "Nie znaleziono użytkownika o podanym adresie e-mail.", messageType: "danger" };
                case 'auth/wrong-password':
                    return { message: "Nieprawidłowe hasło.", messageType: "danger" };
                case 'auth/email-already-in-use':
                    return { message: "Podany adres e-mail jest już używany przez innego użytkownika.", messageType: "danger" };
                case 'auth/weak-password':
                    return { message: "Hasło jest zbyt słabe. Proszę użyć silniejszego hasła.", messageType: "warning" };
                default:
                    return { message: "Wystąpił błąd podczas przetwarzania żądania.", messageType: "danger" };
            }
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (displayName && userCredential.user) {
                try {
                    await updateProfile(userCredential.user, { displayName });
                } catch (err) {
                    console.error("Błąd podczas ustawiania nazwy użytkownika:", err);
                }
            }
            navigate(`/${destination}`);
        } catch (err) {
            const identifiedError = identifyError(err);
            setMessage(identifiedError.message);
            setMessageType(identifiedError.messageType);
            setLoading(false);
        }
    };

    return (
        <div className="login-register-page">
            <div className="flip-card">
                <div className={`flip-card-inner ${isRegister ? "flipped" : ""}`}>
                    <div className="flip-card-front">
                        <LoginForm
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            onSubmit={handleLogin}
                            loading={loading}
                            message={message}
                            messageType={messageType}
                            isVisible={!isRegister}
                        />
                    </div>
                    <div className="flip-card-back">
                        <RegisterForm
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            displayName={displayName}
                            setDisplayName={setDisplayName}
                            onSubmit={handleRegister}
                            loading={loading}
                            message={message}
                            messageType={messageType}
                            isVisible={isRegister}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
