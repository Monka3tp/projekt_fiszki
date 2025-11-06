import "./CategoryCard.css";
import { useNavigate } from "react-router-dom";

function CategoryCard({ id, title, setsCount, image }) {
    const navigate = useNavigate();

    const handleClick = () => {
        // Tworzymy prosty identyfikator w URL, np. "Język angielski" → "angielski"
        const subjectId = title
            .toLowerCase()
            .replace("język ", "") // usuwamy "język " z nazw
            .replace(/\s+/g, "-"); // spacje na myślniki

        navigate(`/subject/${subjectId}`);
    };

    return (
        <div className="card" onClick={handleClick}>
            <img src={image} alt={title} />
            <div className="card-info">
                <h3>{title}</h3>
                <p>Ilość zestawów: {setsCount}</p>
            </div>
        </div>
    );
}

export default CategoryCard;
