import "./App.css";
import Header from "./components/Header";
import CategoryCard from "./components/CategoryCard";
import { categories } from "./data/categories";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/Login";
import SubjectPage from "./components/SubjectPage.jsx";

function Home() {
    return (
        <main className="main">
            <h1 className="title">Fiszki</h1>
            <div className="grid">
                {categories.map((cat) => (
                    <CategoryCard key={cat.id} {...cat} />
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
                <Route path="/subject/:subjectId" element={<SubjectPage />} /> {/* 🔥 nowa trasa */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
