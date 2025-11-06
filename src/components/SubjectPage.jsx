import { useParams } from "react-router-dom";
import CategoryCard from "./CategoryCard";
import { chaptersData } from "../data/chaptersData.jsx";

function SubjectPage() {
    const { subjectId } = useParams();
    const subject = chaptersData[subjectId];

    if (!subject) {
        return <h1>Nie znaleziono przedmiotu</h1>;
    }

    return (
        <main className="main">
            <h1 className="title">{subject.title}</h1>
            <div className="grid">
                {subject.chapters.map((chapter, i) => (
                    <CategoryCard key={i} {...chapter} />
                ))}
            </div>
        </main>
    );
}

export default SubjectPage;
