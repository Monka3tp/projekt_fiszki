import "./App.css";
import Header from "./components/Header";
import CategoryCard from "./components/CategoryCard";
import { categories } from "./data/categories.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/Login";
import CategoryPage from "./components/CategoryPage.jsx";
import SetPage from "./components/SetPage.jsx";

function Home() {
    return (
        <main className="main">
            <h1 className="title">Fiszki</h1>
            <div className="grid">
                {categories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
        </main>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} /> {/* 🔥 nowa trasa */}
                <Route path="/category/:categoryId/:setId" element={<SetPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
