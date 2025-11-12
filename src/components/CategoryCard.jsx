import "./CategoryCard.css";
import { useNavigate } from "react-router-dom";
import { makeSlug } from "../services/tools.jsx";

function CategoryCard({ category }) {
    const navigate = useNavigate();

    const handleClick = () => {
        const derivedCategory = makeSlug(category.title);
        navigate(`/${derivedCategory}/decks`);
    };

    return (
        <div className="card" onClick={handleClick}>
            <img src={category.image} alt={category.title} />
            <div className="card-info">
                <h3>{category.title}</h3>
                <p>Ilość zestawów: {category.deckCount}</p>
            </div>
        </div>
    );
}

export default CategoryCard;