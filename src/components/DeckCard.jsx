import "./CategoryCard.css";
import "../App.css";
import {useNavigate, useParams} from "react-router-dom";
import { makeSlug } from "../services/tools.jsx";

function DeckCard({ category, deck }) {
    const navigate = useNavigate();
    const { categoryId } = useParams();

    const handleClick = () => {
        if (category === "userDecks") {
            navigate(`/deck/${deck.id}`);
            return;
        }
        const deckId = makeSlug(deck.title);
        navigate(`/${categoryId}/${deckId}`);
    };

    return (
        <div className="cat-card" onClick={handleClick}>
            <img src={category==="userDecks" ? "/images/logo.svg" : deck.image} alt={deck.title} />
            <div className="cat-card-info">
                <h3>{deck.title}</h3>
                <p>Ilość fiszek: {category === "userDecks" ? deck.cards.length + " | Stworzone przez użytkownika" : deck.flashcardCount}</p>
            </div>
        </div>
    );
}

export default DeckCard;

