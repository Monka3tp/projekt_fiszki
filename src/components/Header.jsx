import "./Header.css";
import { Link } from "react-router-dom";

function Header() {
    return (
        <header className="header">
            <div className="logo">BrainDeck</div>
            <nav className="nav">
                <a href="#">Utwórz fiszkę</a>
                <a href="#">Twoje fiszki</a>
                <Link to="/login">Zaloguj się</Link>
                <button className="download-btn">Pobierz aplikację</button>
            </nav>
        </header>
    );
}

export default Header;
