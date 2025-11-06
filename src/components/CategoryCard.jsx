import "./CategoryCard.css";

function CategoryCard({ title, setsCount, image }) {
    return (
        <div className="card">
            <img src={image} alt={title} />
            <div className="card-info">
                <h3>{title}</h3>
                <p>Ilość zestawów: {setsCount}</p>
            </div>
        </div>
    );
}

export default CategoryCard;
