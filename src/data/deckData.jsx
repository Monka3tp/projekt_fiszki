const imagesPath = `${process.env.PUBLIC_URL || ''}/images`;


export const deckData = {
    angielski: {
        title: "Język angielski",
        chapters: [
            {
                id: 1,
                title: "Człowiek",
                flashcardCount: 100,
                image: {imagesPath} + "/angielski-czlowiek.jpg",
            },
            {
                id: 2,
                title: "Miejsce zamieszkania",
                flashcardCount: 100,
                image: {imagesPath} + "/angielski-dom.jpg",
            },
            {
                id: 3,
                title: "Podróże",
                flashcardCount: 100,
                image: {imagesPath} + "/angielski-podroze.jpg",
            },
            {
                id: 4,
                title: "Zwierzęta",
                flashcardCount: 100,
                image: {imagesPath} + "/angielski-zwierzeta.jpg",
            },
            {
                id: 5,
                title: "Jedzenie",
                flashcardCount: 100,
                image: {imagesPath} + "/angielski-jedzenie.jpg",
            },
            {
                id: 6,
                title: "Szkoła",
                flashcardCount: 100,
                image: {imagesPath} + "/angielski-czas-przeszly.jpg",
            },
        ],
    },

    polski: {
        title: "Język polski",
        chapters: [
            {
                id: 7,
                title: "Ortografia",
                flashcardCount: 100,
                image: {imagesPath} + "/ortografia.jpg"
            },
            {
                id: 8,
                title: "Lalka",
                flashcardCount: 100,
                image: {imagesPath} + "/lalka.jpg"
            },
            {
                id: 9,
                title: "Przypadki",
                flashcardCount: 100,
                image: {imagesPath} + "/przypadki.jpg"
            },
        ],
    },
    historia: {
        title: "Historia",
        chapters: [
            {
                id: 10,
                title: "Daty",
                flashcardCount: 100,
                image: {imagesPath} + "/daty.jpg"
            },
        ],
    },
    biologia: {
        title: "Biologia",
        chapters: [
            {
                id: 11,
                title: "Człowiek",
                flashcardCount: 100,
                image: {imagesPath} + "/czlowiek-biologia.jpg"
            },
        ],
    },

    inf03: {
        title: "INF.03",
        chapters: [
            {
                id: 12,
                title: "Test teoretyczny INF.03",
                flashcardCount: 100,
                image: {imagesPath} + "/teoretyczny03.jpg"
            },
        ],
    },
    inf04: {
        title: "INF.04",
        chapters: [
            {
                id: 13,
                title: "Test teoretyczny INF.04",
                flashcardCount: 100,
                image: {imagesPath} + "/teoretyczny04.jpg"
            },
        ],
    },


};

