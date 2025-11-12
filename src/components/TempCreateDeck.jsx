// javascript
import React, { useState } from 'react';

export default function TempCreateDeck() {
  const [deckId, setDeckId] = useState('');
  const [flashcards, setFlashcards] = useState([{ front: '', back: '' }]);

  const addFlashcard = () => {
    setFlashcards(prev => [...prev, { front: '', back: '' }]);
  };

  const updateFlashcard = (index, field, value) => {
    setFlashcards(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeFlashcard = index => {
    setFlashcards(prev => prev.filter((_, i) => i !== index));
  };

  const escape = str =>
    String(str)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');

  const buildString = () => {
    if (!deckId.trim()) {
      console.warn('Podaj id decka przed drukowaniem.');
      return '';
    }

    const cards = flashcards
      .map(f => `        {\n            back: "${escape(f.back)}",\n            front: "${escape(f.front)}"\n        }`)
      .join(',\n');

    const result =
`${deckId}: {
    flashcards: [
${cards}
    ],
    isPublic: true,
    ownerId: "0"
},`;

    return result;
  };

  const printString = () => {
    const output = buildString();
    if (output) console.log(output);
  };

  return (
    <div>
      <div>
        <label>
          Id decka:
          <input
            type="text"
            value={deckId}
            onChange={e => setDeckId(e.target.value)}
            placeholder="np. angielski_czlowiek"
          />
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={addFlashcard}>
          Dodaj nową fiszkę
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {flashcards.map((f, i) => (
          <li key={i} style={{ marginTop: 8 }}>
            <input
              placeholder="front"
              value={f.front}
              onChange={e => updateFlashcard(i, 'front', e.target.value)}
              style={{ marginRight: 8 }}
            />
            <input
              placeholder="back"
              value={f.back}
              onChange={e => updateFlashcard(i, 'back', e.target.value)}
              style={{ marginRight: 8 }}
            />
            <button type="button" onClick={() => removeFlashcard(i)}>
              Usuń
            </button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12 }}>
        <button type="button" onClick={printString}>
          Drukuj string do konsoli
        </button>
      </div>
    </div>
  );
}
