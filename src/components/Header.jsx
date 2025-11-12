import React, { useState } from "react";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Dropdown from "react-bootstrap/Dropdown";
import Fade from "react-bootstrap/Fade";
import InstallButton from "./InstallButton.jsx";

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            setOpen(false);
            navigate("/");
        } catch (e) {
            console.error("Logout error:", e);
        }
    };

    const initials = user && user.displayName
        ? user.displayName.split(" ").map(s => s[0]).slice(0,2).join("")
        : (user && user.email ? user.email[0].toUpperCase() : "U");

    return (
        <header className="header" style={{ position: "relative" }}>
            <div className="logo">BrainDeck</div>
            <nav className="nav">
                <Link to={"/create-flashcards-set"}>Utwórz zestaw fiszek</Link>

                {user ? (
                    <Dropdown align="end" show={open} onToggle={(nextShow) => setOpen(nextShow)}>
                        <Dropdown.Toggle as="button" className="profile-badge" id="profile-toggle">
                            <div className="profile-initials">{initials}</div>
                            <span className="profile-name">{user.displayName || user.email}</span>
                        </Dropdown.Toggle>

                        <Fade in={open}>
                            <Dropdown.Menu className="profile-dropdown" show={open}>
                                <Dropdown.Item as={Link} to="/your-sets" onClick={() => setOpen(false)}>Twoje fiszki</Dropdown.Item>
                                <Dropdown.Item onClick={handleLogout}>Wyloguj się</Dropdown.Item>
                            </Dropdown.Menu>
                        </Fade>
                    </Dropdown>
                ) : (
                    <Link to="/login">Zaloguj się</Link>
                )}

                <InstallButton/>
            </nav>
        </header>
    );
}

export default Header;