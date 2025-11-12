import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import Header from "./components/Header";
import CategoryCard from "./components/CategoryCard";
import { categories } from "./data/categories.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CategoryPage from "./components/CategoryPage.jsx";
import SetPage from "./components/SetPage.jsx";
import LoginRegisterPage from "./components/LoginRegisterPage.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

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
        <AuthProvider>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginRegisterPage />} />
                    <Route path="/register" element={<LoginRegisterPage />} />
                    <Route path="/:categoryId/sets" element={<CategoryPage />} />
                    <Route path="/:categoryId/:setId" element={<SetPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;