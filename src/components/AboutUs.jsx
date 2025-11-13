import React from "react";
import "./AboutUs.css";

function AboutUs() {
    return (
        <section className="aboutus" id="aboutus">
            <div className="aboutus-overlay">
                <div className="aboutus-container">
                    <h1 className="aboutus-title">O nas</h1>
                    <p className="aboutus-text">
                        Jesteśmy grupą pasjonatów, którzy wierzą, że edukacja ma moc zmieniania świata.
                        Naszym celem jest wspieranie uczniów, nauczycieli oraz rodziców w procesie nauki —
                        poprzez nowoczesne rozwiązania, materiały dydaktyczne i narzędzia online.
                    </p>
                    <p className="aboutus-text">
                        Chcemy, aby wiedza była dostępna dla każdego, niezależnie od wieku, miejsca zamieszkania
                        czy możliwości finansowych. Wspieramy inicjatywy, które rozwijają ciekawość, kreatywność
                        i krytyczne myślenie.
                    </p>
                    <p className="aboutus-text">
                        Nasza misja to tworzenie przestrzeni, w której nauka staje się przyjemnością,
                        a nie obowiązkiem. Razem możemy zbudować lepszą przyszłość poprzez edukację!
                    </p>
                </div>
            </div>
        </section>
    );
}

export default AboutUs;
