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
import CreateDeck from "./components/CreateDeck.jsx";
import Footer from "./components/Footer.jsx";
import AboutUs from "./components/AboutUs.jsx";
import { useState } from "react";

function Home() {
    const [search, setSearch] = useState("");

    const filteredCategories = categories.filter((category) =>
        category.title.toLowerCase().includes(search.toLowerCase())
    );

    const popularDecks = [
        { name: "Człowiek", categorySlug: "jezyk-angielski" },
        { name: "Lalka", categorySlug: "jezyk-polski" },
        { name: "Ortografia", categorySlug: "jezyk-polski" },
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
            {/*TO JEST TO CO BYLO*/}
            {/*<div className="grid">*/}
            {/*    {categories.map((category) => (*/}
            {/*        <CategoryCard key={category.id} category={category}/>*/}
            {/*    ))}*/}
            {/*</div>*/}


            {/*TO JEST DODANE PRZEZ MONKE KROMKE JAK COS TO USUN JAkby cos nie dzialalo:))))))*/}
            <div className="grid">
                {filteredCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
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
                            href={`/${deck.categorySlug}/decks`}
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
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginRegisterPage />} />
                    <Route path="/register" element={<LoginRegisterPage />} />
                    <Route path="/:categoryId/decks" element={<CategoryPage />} />
                    <Route path="/:categoryId/:deckId" element={<DeckPage />} />
                    <Route path="/create-deck" element={<CreateDeck />} />
                </Routes>
            </BrowserRouter>
            <Footer />
        </AuthProvider>

    );
}
export default App;