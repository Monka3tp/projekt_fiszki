import "./App.css";
import Header from "./components/Header";
import CategoryCard from "./components/CategoryCard";
import { categories } from "./data/categories";

function App() {
    return (
        <div>
            <Header />
            <main className="main">
                <h1 className="title">Fiszki</h1>
                <div className="grid">
                    {categories.map((cat) => (
                        <CategoryCard key={cat.id} {...cat} />
                    ))}
                </div>
            </main>
        </div>
    );
}

export default App;
