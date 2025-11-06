import React from "react";
import "./Login.css";
import Header from "./Header.jsx";

const LoginPage = () => {
    return (
        <div className="login-page">


            <main className="login-container">
                <h1>Zaloguj się</h1>
                <p className="login-subtitle">Witaj ponownie w BrainDeck</p>

                <form className="login-form">
                    <label htmlFor="email">Adres e-mail</label>
                    <input type="email" id="email" placeholder="Wpisz e-mail" required />

                    <label htmlFor="password">Hasło</label>
                    <input type="password" id="password" placeholder="Wpisz hasło" required />

                    <button type="submit" className="btn-primary full-width">Zaloguj się</button>
                </form>

                <p className="login-footer">
                    Nie masz konta? <a href="#">Zarejestruj się</a>
                </p>
            </main>
        </div>
    );
};

export default LoginPage;
