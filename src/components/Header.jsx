import "./Header.css";

function Header() {
    return (
        <header className="header">
            <div className="logo">BrainDeck</div>
            <nav className="nav">
                <a href="#">Utwórz fiszkę</a>
                <a href="#">Twoje fiszki</a>
                <a href="#">Zaloguj się</a>
                <button className="download-btn">Pobierz aplikację</button>
            </nav>
        </header>
    );
}

export default Header;
