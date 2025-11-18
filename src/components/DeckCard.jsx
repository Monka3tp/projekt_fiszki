import "./CategoryCard.css";
import "../App.css";
import {useNavigate, useParams} from "react-router-dom";
import { makeSlug } from "../services/tools.jsx";

function DeckCard({ category, deck }) {
    const navigate = useNavigate();
    const { categoryId } = useParams();

    const handleClick = () => {
        if (category === "userDecks") {
            navigate(`/${deck.id}`);
            return;
        }
        const deckId = makeSlug(deck.title);
        navigate(`/${categoryId}/${deckId}`);
    };

    return (
        <div className="cat-card" onClick={handleClick}>
            <div className="cat-card-info">
                <h3>{deck.title}</h3>
                <p>Ilość zestawów: {deck.flashcardCount}</p>
            </div>
        </div>
    );
}

export default DeckCard;

