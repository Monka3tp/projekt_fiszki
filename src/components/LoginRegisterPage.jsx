
import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "../App.css";
import "./LoginRegisterPage.css";

import { auth } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
} from "firebase/auth";

function LoginForm({ email, setEmail, password, setPassword, onSubmit, loading, error }) {
    return (
        <div className="login-register-container">
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

                {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

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
    error,
}) {
    return (
        <div className="login-register-container">
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

                {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

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

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // resetuj formularz i błędy przy zmianie widoku
    useEffect(() => {
        setError("");
        setLoading(false);
        setEmail("");
        setPassword("");
        setDisplayName("");
    }, [path]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);

            navigate("/");
        } catch (err) {
            setError(err.message || "Błąd logowania");
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (displayName && userCredential.user) {
                try {
                    await updateProfile(userCredential.user, { displayName });
                } catch (_) {
                    // ignore profile update errors
                }
            }
            navigate("/");
        } catch (err) {
            setError(err.message || "Błąd rejestracji");
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
                            error={error}
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
                            error={error}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}