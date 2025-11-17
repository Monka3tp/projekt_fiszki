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

function Home() {
    return (
        <main className="main">
            <h1 className="title">Fiszki</h1>
            <div className="grid">
                {categories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
            <AboutUs />
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