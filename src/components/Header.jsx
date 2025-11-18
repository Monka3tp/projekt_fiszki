// `src/components/Header.jsx`
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
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            setOpen(false);
            setMobileOpen(false);
            navigate("/");
        } catch (e) {
            console.error("Logout error:", e);
        }
    };

    const initials = user && user.displayName
        ? user.displayName.split(" ").map(s => s[0]).slice(0,2).join("")
        : (user && user.email ? user.email[0].toUpperCase() : "U");

    const logoSrc = "/images/logo.svg"; // avoid direct `process` usage to satisfy ESLint

    return (
        <header className="header" style={{ position: "relative" }}>
            <Link to={"/"} className="logo"><img src={logoSrc} alt={"BrainDeck"} /></Link>
            <nav className="nav">
                {/* Desktop / large screens - original links */}
                <div className="nav-items">
                    <Link to={"/edit-deck/new"}>Utwórz zestaw fiszek</Link>

                    {user ? (
                        <Dropdown align="end" show={open} onToggle={(nextShow) => setOpen(nextShow)} className="profile-dropdown-desktop">
                            <Dropdown.Toggle as="button" className="profile-badge" id="profile-toggle">
                                <div className="profile-initials">{initials}</div>
                                <span className="profile-name">{user.displayName || user.email}</span>
                            </Dropdown.Toggle>

                            <Fade in={open}>
                                <Dropdown.Menu className="profile-dropdown" show={open}>
                                    <Dropdown.Item as={Link} to="/your-decks" onClick={() => setOpen(false)}>Twoje fiszki</Dropdown.Item>
                                    <Dropdown.Item onClick={handleLogout}>Wyloguj się</Dropdown.Item>
                                </Dropdown.Menu>
                            </Fade>
                        </Dropdown>
                    ) : (
                        <Link to="/login">Zaloguj się</Link>
                    )}

                    <div className="install-desktop"><InstallButton/></div>
                </div>

                {/* Mobile burger dropdown - visible only on small screens */}
                <Dropdown align="end" show={mobileOpen} onToggle={(nextShow) => setMobileOpen(nextShow)} className="mobile-dropdown">
                    <Dropdown.Toggle as="button" className="burger" id="mobile-burger" aria-label="Menu">
                        ☰
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="profile-dropdown" show={mobileOpen}>
                        <Dropdown.Item as={Link} to={"/edit-deck/new"} onClick={() => setMobileOpen(false)}>Utwórz zestaw fiszek</Dropdown.Item>

                        {user ? (
                            <>
                                <Dropdown.Item as={Link} to="/your-decks" onClick={() => setMobileOpen(false)}>Twoje fiszki</Dropdown.Item>
                                <Dropdown.Item onClick={() => { setMobileOpen(false); handleLogout(); }}>Wyloguj się</Dropdown.Item>
                            </>
                        ) : (
                            <Dropdown.Item as={Link} to="/login" onClick={() => setMobileOpen(false)}>Zaloguj się</Dropdown.Item>
                        )}

                        <Dropdown.Item as="div" onClick={() => setMobileOpen(false)}>
                            <InstallButton/>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </nav>
        </header>
    );
}

export default Header;
