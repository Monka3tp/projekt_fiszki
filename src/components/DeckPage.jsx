import React from "react";
import "./DeckPage.css";
import {useParams} from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

function DeckPage() {
    const { deckId } = useParams();

    return (
        <div className="chapter-page">
            <i className="bi bi-x" style={{fontSize: "120px", color: "white"}}></i>
            <div className="chapter-content">
                <h2>{deckId} Chapter Page</h2>
                <p>This is where the chapter content will be displayed.</p>
            </div>
            <i className="bi bi-check" style={{fontSize: "120px", color: "white"}}></i>
        </div>
    );
}

export default DeckPage;

