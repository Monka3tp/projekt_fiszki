// src/App.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import Header from "./components/Header";
import CategoryCard from "./components/CategoryCard";
import { categories } from "./data/categories.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CategoryPage from "./components/CategoryPage.jsx";
import DeckPage from "./components/DeckPage.jsx";
import LoginRegisterPage from "./components/LoginRegisterPage.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import EditDeck from "./components/EditDeck.jsx";
import Footer from "./components/Footer.jsx";
import AboutUs from "./components/AboutUs.jsx";
import {useEffect, useState} from "react";
import MyDecksPage from "./components/MyDecks.jsx";
import {getPublicDecks} from "./services/deckService.js";
import DeckCard from "./components/DeckCard.jsx";

function Home() {
    const [search, setSearch] = useState("");
    const [publicDecks, setPublicDecks] = useState([]);

    const filteredCategories = categories.filter((category) =>
        category.title.toLowerCase().includes(search.toLowerCase())
    );

    // Pobierz publiczne zestawy raz przy montowaniu
    useEffect(() => {
        getPublicDecks(setPublicDecks);
    }, []);

    // Filtruj decki z publicDecks na podstawie search
    const filteredDecks = (publicDecks || []).filter((deck) =>
        deck.title?.toLowerCase().includes(search.toLowerCase())
    );

    const popularDecks = [
        { name: "Człowiek", categorySlug: "angielski/czlowiek" },
        { name: "Lalka", categorySlug: "polski/lalka" },
        { name: "Ortografia", categorySlug: "polski/ortografia" },
    ];

    return (
        <main className="main">
            <h1 className="title">Fiszki</h1>
            <p className="subtitle">Wybierz kategorię, aby rozpocząć naukę</p>

            <input
                type="text"
                placeholder="Wyszukaj kategorię..."
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="grid">
                {filteredCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
                {filteredDecks.map((deck) => (
                    <DeckCard key={deck.id} category={"userDecks"} deck={deck} />
                ))}
            </div>

            <div className="stats">
                <div className="stat-box">
                    <strong>600+</strong>
                    <span>Zestawów fiszek</span>
                </div>
                <div className="stat-box">
                    <strong>10 000+</strong>
                    <span>Fiszek do nauki</span>
                </div>
                <div className="stat-box">
                    <strong>∞</strong>
                    <span>Możliwości nauki</span>
                </div>
            </div>

            <section className="popular-section">
                <h2>Popularne zestawy</h2>
                <div className="popular-list">
                    {popularDecks.map((deck, index) => (
                        <a
                            key={index}
                            className="popular-item"
                            href={`/${deck.categorySlug}`}
                        >
                            ⭐ {deck.name}
                        </a>
                    ))}
                </div>
            </section>

            <AboutUs/>
        </main>
    );
}

function App() {
    return (
        <AuthProvider>
            <div className={"app"}>

                <BrowserRouter>
                    <div className="content">
                        <Header />
                        <div className={"page"}>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<LoginRegisterPage />} />
                                <Route path="/register" element={<LoginRegisterPage />} />
                                <Route path="/:categoryId/decks" element={<CategoryPage />} />
                                <Route path="/:categoryId/:deckId" element={<DeckPage />} />
                                <Route path="/deck/:deckId" element={<DeckPage />} />
                                <Route path="/edit-deck/:deckId" element={<EditDeck />} />
                                <Route path="/your-decks" element={<MyDecksPage />} />
                            </Routes>
                        </div>
                        <Footer />
                    </div>
                </BrowserRouter>
            </div>
        </AuthProvider>
    );
}
export default App;
