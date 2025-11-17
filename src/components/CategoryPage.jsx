import { useParams, Link } from "react-router-dom";
import "../App.css";
import DeckCard from "./DeckCard.jsx";
import { deckData } from "../data/deckData.jsx";

function CategoryPage() {
    const { categoryId } = useParams();
    const category = deckData[categoryId];

    if (!category) {
        return (
            <main className="main">
                <h1 className="title">Przedmiot nie znaleziony</h1>
                <p>Nie znaleziono wybranego przedmiotu. <Link to="/" className="link">Wróć do listy przedmiotów</Link>.</p>
            </main>
        );
    }

    return (
        <main className="main">
            <h1 className="title">{category.title}</h1>
            <div className="grid">
                {category.chapters && category.chapters.length > 0 ? (
                    category.chapters.map((deck, i) => (
                        <DeckCard
                            key={i}
                            category={category}
                            deck={deck}
                        />
                    ))
                ) : (
                    <p>Brak rozdziałów dla tego przedmiotu.</p>
                )}
            </div>
        </main>
    );
}

export default CategoryPage;