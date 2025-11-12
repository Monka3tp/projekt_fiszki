// javascript
const imagesPath = `${process.env.PUBLIC_URL || ''}/images`;

export const categories = [
  {
    id: 1,
    title: "Język angielski",
    setCount: 100,
    deckCount: 100,
    image: encodeURI(`${imagesPath}/flaga-angielski.jpg`),
  },
  {
    id: 2,
    title: "Język polski",
    setCount: 100,
    deckCount: 100,
    image: encodeURI(`${imagesPath}/polski-flaga.png`),
  },
  {
    id: 3,
    title: "Historia",
    setCount: 100,
    deckCount: 100,
    image: encodeURI(`${imagesPath}/historia-obraz.png`),
  },
  {
    id: 4,
    title: "Biologia",
    setCount: 100,
    deckCount: 100,
    image: encodeURI(`${imagesPath}/zdjecie-biologia.png`),
  },
  {
    id: 5,
    title: "Egzamin INF.03",
    setCount: 100,
    deckCount: 100,
    image: encodeURI(`${imagesPath}/inf03-obraz.png`),
  },
  {
    id: 6,
    title: "Egzamin INF.04",
    setCount: 100,
    deckCount: 100,
    image: encodeURI(`${imagesPath}/inf03-obraz.png`),
  },
];