// javascript
// src/components/MyDecks.jsx
import {Link, useLocation, useNavigate} from "react-router-dom";
import "../App.css";
import DeckCard from "./DeckCard.jsx";
import {getUserDecks} from "../services/deckService.js";
import {useAuth} from "../contexts/AuthContext.jsx";
import {GridLoader} from "react-spinners";
import React, {useEffect, useState} from "react";

function MyDecksPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [decks, setDecks] = useState([]);

  useEffect(() => {
    if (loading === false && user !== null) {
      return getUserDecks(user.uid, setDecks);
    }
  }, [user, loading]);

  useEffect(() => {
    if (loading === false && user === null) {
      navigate("/login", {
        state: {
          message: "Musisz być zalogowany, aby tworzyć zestawy fiszek.",
          messageType: "warning",
          from: location.pathname,
        },
      });
    }
  }, [loading, user, navigate, location]);

  if (loading) {
    return (
      <div className="loader-container" style={{ display: "flex", justifyContent: "center", margin: "50px" }}>
        <GridLoader color={"#9b4dff"} size={15} />
      </div>
    );
  }

  return (
    <main className="main">
      <h1 className="title">Moje zestawy</h1>
      <div className="grid">
        {decks && decks.length > 0 ? (
          decks.map((d) => <DeckCard key={d.id} deck={d} category={"userDecks"} />)
        ) : (
            <p>Nie masz jeszcze żadnych zestawów. <Link className={"link"} to={"/edit-deck/new"}>Utwrórz zestaw teraz</Link>!</p>
        )}
      </div>
    </main>
  );
}

export default MyDecksPage;
