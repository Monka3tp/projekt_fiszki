import "./CategoryCard.css";
import {useNavigate, useParams} from "react-router-dom";
import { makeSlug } from "../services/tools.jsx";

function SetCard({ set }) {
    const navigate = useNavigate();
    const { categoryId } = useParams()
    const handleClick = () => {
        const setId = makeSlug(set.title);
        navigate(`/category/${categoryId}/${setId}`);
    };

    return (
        <div className="card" onClick={handleClick}>
            <img src={set.image} alt={set.title} />
            <div className="card-info">
                <h3>{set.title}</h3>
                <p>Ilość zestawów: {set.flashcardCount}</p>
            </div>
        </div>
    );
}

export default SetCard;