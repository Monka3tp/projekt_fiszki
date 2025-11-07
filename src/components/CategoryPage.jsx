import { useParams, Link } from "react-router-dom";
import SetCard from "./SetCard.jsx";
import { setData } from "../data/setData.jsx";

function CategoryPage() {
    const { categoryId } = useParams();
    const category = setData[categoryId];

    if (!category) {
        return (
            <main className="main">
                <h1 className="title">Przedmiot nie znaleziony</h1>
                <p>Nie znaleziono wybranego przedmiotu. <Link to="/">Wróć do listy przedmiotów</Link>.</p>
            </main>
        );
    }

    return (
        <main className="main">
            <h1 className="title">{category.title}</h1>
            <div className="grid">
                {category.chapters && category.chapters.length > 0 ? (
                    category.chapters.map((set, i) => (
                        <SetCard
                            key={i}
                            category={category}
                            set={set}
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