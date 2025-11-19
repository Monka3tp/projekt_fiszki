import React, { useState, useRef, useEffect } from "react";
import "./EditDeck.css";
import {useAuth} from "../contexts/AuthContext.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {GridLoader} from "react-spinners";
import { createDeck, updateDeck, getDeckById } from "../services/deckService.js";

export default function EditDeck() {
  const {user, loading} = useAuth();
  const navigate = useNavigate();
  
  const deckId = useParams().deckId;

  // każda karta ma teraz też displayedSide: która strona jest aktualnie wyświetlana na faces
  const [loadedCards, setLoadedCards] = useState(false);

  const [deck, setDeck] = useState({}); // cały deck z serwera
  const [cards, setCards] = useState(() => [{ front: "", back: "", flipped: false, displayedSide: "front", counterRotated: false, buttonFlipped: false }]);
  const [active, setActive] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [isFan, setIsFan] = useState(() => window.innerWidth > window.innerHeight || window.innerWidth >= 720);
  const inputsRef = useRef([]); // będzie trzymać obiekty { front: el|null, back: el|null }
  const cardRefs = useRef([]); // refs do DOM kontenerów .card
  const flipTimeouts = useRef({}); // timeouty mid-flip per card index
  const accRef = useRef(0);
  const rafRef = useRef(null);
  const focusedRef = useRef({ index: null });
  const suppressBlurRef = useRef(false); // podczas flipowania blokuje chwilowe blur

  const [title, setTitle] = useState("");
  const [visible, setVisible] = useState("public");

  
  useEffect(() => {
    if (deckId && deckId !== "new" && user && !loadedCards) {
      getDeckById(deckId).then(fetchedDeck => {
                setDeck(fetchedDeck || {});
            }).catch(err => {
                console.error("Error fetching deck:", err);
            });
    }
  }, [deckId, user, navigate, loadedCards]);

  useEffect(() => {
        if (!deck || !deck.cards) return;
        setTitle(deck.title || "");
        setVisible(deck.visible || "public");
        setCards(deck.cards.map(card => ({
            ...card,
            flipped: false,
            displayedSide: "front",
            counterRotated: false,
            buttonFlipped: false
        })));
        setLoadedCards(true);
    }, [deck]);
  
  // Ustaw suppress BEFORE blur (mousedown / touchstart / keydown) — dzięki temu blur handler nie zdąży się wykonać przed click
  // Przy okazji zapobiegamy focusowaniu przycisku przez preventDefault na mousedown
  const beginSuppress = (e) => {
    if (e && typeof e.preventDefault === "function") {
      // zapobiegamy, by flip-btn przejął fokus
      e.preventDefault();
    }
    suppressBlurRef.current = true;
  };

  useEffect(() => {
    // zachowaj tablicę refs, przycinając do długości kart
    inputsRef.current = inputsRef.current.slice(0, cards.length);
    cardRefs.current = cardRefs.current.slice(0, cards.length);
  }, [cards.length]);

  // cleanup timeoutów przy unmount
  useEffect(() => {
    return () => {
      Object.values(flipTimeouts.current).forEach((t) => clearTimeout(t));
      flipTimeouts.current = {};
    };
  }, []);

  // Responsive layout mode
  useEffect(() => {
    const onResize = () => setIsFan(window.innerWidth > window.innerHeight || window.innerWidth >= 720);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const step = () => {
      accRef.current *= 0.92;
      if (Math.abs(accRef.current) < 0.5) accRef.current = 0;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const clampIndex = (i) => {
    const n = cards.length;
    if (n === 0) return 0;
    return ((i % n) + n) % n;
  };

  const applyWheelSteps = (steps) => {
    if (!steps) return;
    suppressBlurRef.current = true;
    setActive((a) => clampIndex(a + steps));
    // Reset po krótkim opóźnieniu, aby pozwolić na ustawienie fokusu
    setTimeout(() => {
      suppressBlurRef.current = false;
    }, 100);
  };

  const handleWheelDelta = (deltaY) => {
    const wheelStep = 100;
    accRef.current += deltaY;
    const steps = Math.trunc(accRef.current / wheelStep);
    if (steps !== 0) {
      applyWheelSteps(steps);
      accRef.current -= steps * wheelStep;
    }
  };

  const onWheel = (e) => {
    handleWheelDelta(e.deltaY);
    e.preventDefault();
  };

  const touch = useRef({ startY: 0, lastY: 0, startT: 0 });
  const onTouchStart = (e) => {
    const y = e.touches[0].clientY;
    touch.current = { startY: y, lastY: y, startT: Date.now() };
  };
  const onTouchMove = (e) => {
    const y = e.touches[0].clientY;
    const dy = touch.current.lastY - y;
    touch.current.lastY = y;
    handleWheelDelta(dy * 1.2);
    e.preventDefault();
  };
  const onTouchEnd = () => {
    const dt = Math.max(1, Date.now() - touch.current.startT);
    const dist = touch.current.startY - touch.current.lastY;
    const velocity = dist / dt;
    const flingPx = velocity * 600;
    handleWheelDelta(flingPx);
  };

  const toggleFlip = (i, e) => {
    e.stopPropagation();
    suppressBlurRef.current = true;

    const curRefs = inputsRef.current[i] || {};
    const activeEl = document.activeElement;
    const focusedSide =
      activeEl === curRefs.front ? "front" : activeEl === curRefs.back ? "back" : null;

    if (focusedSide) focusedRef.current = { index: i, side: focusedSide };

    // obliczamy docelowy stan flipu (intencja) bazując na aktualnym stanie karty
    const curCardSnapshot = cards[i] || { front: "", back: "", flipped: false, displayedSide: "front", counterRotated: false };
    const intendedFlipped = !curCardSnapshot.flipped;

    // przełączamy stan flipu (wizualnie) i ustawiamy counterRotated na wartość odpowiadającą bieżącemu flipped (aby uniknąć natychmiastowego obrotu)
    setCards((prev) => prev.map((c, idx) => (idx === i ? { ...c, flipped: intendedFlipped, counterRotated: curCardSnapshot.flipped, buttonFlipped: curCardSnapshot.flipped } : c)));

    // usuń ewentualny wcześniejszy timeout dla tej karty
    if (flipTimeouts.current[i]) {
      clearTimeout(flipTimeouts.current[i]);
      delete flipTimeouts.current[i];
    }

    // opóźnij zmianę displayedSide i counterRotated do połowy animacji (mid-flip)
    const midMs = 120;
    const intendedDisplayed = intendedFlipped ? "back" : "front";
    flipTimeouts.current[i] = setTimeout(() => {
      // w połowie flipu zmieniamy displayedSide i ustawiamy counterRotated zgodnie z intendedFlipped
      setCards((prev) =>
        prev.map((c, idx) => (idx === i ? { ...c, displayedSide: intendedDisplayed, counterRotated: intendedFlipped, buttonFlipped: intendedFlipped } : c))
      );
      delete flipTimeouts.current[i];
    }, midMs);

    if (focusedSide) {
      let cleaned = false;
      let fallbackTimer = null;
      let listenerEl = null;

      // helper: próbuj sfokusować target kilkukrotnie (sync, RAF, timeout)
      const tryFocusMultiple = (target) => {
        if (!target) return;
        try { target.focus(); } catch (err) {console.error(err)}
        requestAnimationFrame(() => {
          try { target.focus(); } catch (err) {console.error(err)}
        });
        // dodatkowy krótki timeout
        setTimeout(() => {
          try { target.focus(); } catch (err) {console.error(err)}
        }, 60);
      };

      const doFocus = () => {
        if (cleaned) return;
        cleaned = true;

        const target = inputsRef.current[i] && inputsRef.current[i].front;
        if (target) {
          try {
            // wielokrotne podejście — synchron, raf i timeout
            tryFocusMultiple(target);
            const len = (target.value || "").length;
            target.setSelectionRange && target.setSelectionRange(len, len);
          } catch (err) {
            console.error(err);
          }
          setInputFocused(true);
          focusedRef.current = { index: i };
        }

        // przywróć obsługę blur i sprzątnij listener/fallback
        suppressBlurRef.current = false;
        if (listenerEl) {
          listenerEl.removeEventListener("transitionend", onTransEnd);
          listenerEl = null;
        }
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
      };

      function onTransEnd(ev) {
        if (ev.propertyName === "transform") doFocus();
      }

      // dodaj listener na aktualnym elemencie po re-renderze (next paint)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          listenerEl = cardRefs.current[i] || null;
          if (listenerEl) {
            listenerEl.addEventListener("transitionend", onTransEnd);
          }
          // fallback: jeśli transitionend nie nadejdzie, spróbuj przez RAF lub wymuś doFocus po czasie
          fallbackTimer = setTimeout(() => {
            requestAnimationFrame(() => requestAnimationFrame(doFocus));
          }, 520);
        });
      });
    } else {
      // brak fokusu wcześniej — szybko przywracamy obsługę blur
      setTimeout(() => {
        suppressBlurRef.current = false;
      }, 40);
    }
  };

  const addCard = () => {
    const newIndex = cards.length;
    setCards((prev) => [...prev, { front: "", back: "", flipped: false, displayedSide: "front", counterRotated: false, buttonFlipped: false }]);
    setActive(newIndex);
    if (inputFocused) {
      setInputFocused(true);
      focusedRef.current = { index: newIndex };
      // Opóźnij fokus, aby dać czas na render nowej karty
      setTimeout(() => {
        const el = inputsRef.current[newIndex] && inputsRef.current[newIndex].front;
        if (el) {
          el.focus();
          const len = (el.value || "").length;
          el.setSelectionRange && el.setSelectionRange(len, len);
        }
      }, 50);
    }
  };

  const updateCardText = (i, side, value) => {
    setCards((prev) => prev.map((c, idx) => (idx === i ? { ...c, [side]: value } : c)));
  };

  const handleWrapMouseDown = (e) => {
    const tgt = e.target;
    if (tgt.closest && (tgt.closest(".seamless-input") || tgt.closest(".flip-btn") || tgt.closest(".flip-toggle"))) {
      return;
    }
    setInputFocused(false);
  };


  const handleInputBlur = () => {
    // jeśli blur spowodowany jest zamierzoną akcją flip (suppress), ignorujemy go
    if (suppressBlurRef.current) return;
    console.log("Input blur detected");
    setTimeout(() => {
      const activeEl = document.activeElement;
      // jeśli żaden z inputów w tablicy nie jest aktywny to ustaw inputFocused false
      const stillInput = inputsRef.current.some((obj) => {
        if (!obj) return false;
        return obj.front === activeEl || obj.back === activeEl;
      });
      if (!stillInput) {
        setInputFocused(false);
        focusedRef.current = { index: null };
      }
    }, 0);
  };

  // side-aware focus handler
  const handleInputFocusSide = (i) => {
    setInputFocused(true);
    setActive(i);
    focusedRef.current = { index: i };
  };

  // po zmianie active: jeśli był fokus (focusedRef.index !== null), przenieś fokus na tę samą stronę nowej aktywnej karty, ale jeśli strona nie jest widoczna, użyj widocznej strony
  useEffect(() => {
    if (focusedRef.current.index === null) return;
    const curCard = cards[active];
    if (!curCard) return;

    // Zawsze fokusuj front (widoczny input)
    const sideToFocus = "front";

    // Użyj podwójnego RAF dla lepszego timing, jak w toggleFlip
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = inputsRef.current[active] && inputsRef.current[active][sideToFocus];
        if (el) {
          el.focus();
          setInputFocused(true);
          focusedRef.current = { index: active };
          // Dodatkowy fallback: wymuś focus ponownie po krótkim czasie, jeśli nie został ustawiony
          setTimeout(() => {
            if (document.activeElement !== el) {
              el.focus();
            }
          }, 50);
        }
      });
    });
  }, [active, cards]);

  const mapNorm = (n) => {
    const pow = 0.85;
    return Math.sign(n) * Math.pow(Math.abs(n), pow);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const deckData = {
      title: title,
      cards: cards.map((c) => ({ front: c.front, back: c.back })),
      visible: visible,
    };
    if (deckId && deckId !== "new") {
      updateDeck(deckId, deckData)
        .then(() => {
          navigate(`/deck/${deckId}`);
        })
        .catch((err) => {
          console.error("Error updating deck:", err);
        });
    } else {
      // Poprawione wywołanie createDeck
      createDeck(user.uid, deckData)
        .then((docRef) => {
          navigate(`/deck/${docRef.id}`);
        })
        .catch((err) => {
          console.error("Error creating deck:", err);
        });
    }
  }

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
  }, [loading, user, navigate]);

  // dopiero tutaj, po wszystkich hookach, zwróć loader podczas ładowania
  if (loading || (deckId && deckId !== "new" && !loadedCards)) {
    return <div className="loader-container" style={{display: "flex", justifyContent: "center", margin: "50px"}}>
      <GridLoader color={"#9b4dff"} size={15} />
    </div>;
  }


  // ile kart po każdej stronie ma być widocznych (główna karta + N po każdej stronie)
  const VISIBLE_SIDE = 4;

  return (
    <div
      className={`deck-wrap ${inputFocused ? "focused" : ""} ${isFan ? "fan" : "wheel-mode"}`}
      onWheel={onWheel}
      onMouseDown={handleWrapMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "none" }}
    >
      <div className="deck-editor" style={{display: "flex", justifyContent: "center"}}>
        <input type={"text"} className={"title-input"} placeholder={"Tytuł"} value={title} onChange={(e) => setTitle(e.target.value)}/>
        <select className={"form-select visibility-select"} defaultValue={"public"} value={visible} onChange={(e) => setVisible(e.target.value)}>
          <option value={"public"}>Publiczny</option>
          <option value={"unlisted"}>Niepubliczny</option>
          <option value={"private"}>Prywatny</option>
        </select>
      </div>
      <div className="wheel" style={{ transformStyle: "preserve-3d" }}>
        {cards.map((card, i) => {
          const n = cards.length;
          // obliczamy "norm" jak wcześniej (z wrap-around)
          const offset = i - active;
          const mid = Math.floor(n / 2);
          let norm = ((offset + n + mid) % n) - mid;

          // jeśli karta jest dalej niż VISIBLE_SIDE (w obie strony), jej render pomijamy
          if (Math.abs(norm) > Math.min(VISIBLE_SIDE, Math.floor(n/2))) {
            return null;
          }

          // displayedSide decyduje, jaka wartość jest aktualnie renderowana na fronts/backs
          const displayedFrontKey = card.displayedSide || "front";
          const displayedBackKey = displayedFrontKey === "front" ? "back" : "front";

          const mapped = mapNorm(norm);
          const gapDeg = isFan ? 10 : 12;
          const angleDeg = mapped * gapDeg;
          const angleRad = (angleDeg * Math.PI) / 180;
          const radius = isFan ? 110 : 100;
          const amplitudeMultiplier = 1 - Math.min(Math.abs(mapped) * 0.06, 0.6);

          // FAN layout: translateX amplitude decreases z with distance; distant cards go slightly down
          let x = 0;
          let y = Math.sin(angleRad) * radius * amplitudeMultiplier * (isFan ? 0.15 : 1);
          let z = Math.cos(angleRad) * radius - radius - Math.abs(mapped) * (isFan ? 8 : 12);
          let rotateY = 0;
          let rotateZ = isFan ? angleDeg * 0.35 : 0;

          if (isFan) {
            // amplitude falls with distance: central cards stick out more, outer ones less
            const baseSpread = 220; // maximum spread for near-center
            const spreadFactor = Math.max(0.22, 1 - Math.abs(mapped) * 0.22); // maleje z odległością
            const spreadX = baseSpread * spreadFactor;
            x = mapped * spreadX;

            rotateY = -mapped * 14;
            rotateZ = mapped * 6;

            // center card forward, others further back
            z = isActiveIndex(i, active) ? 40 : -Math.abs(mapped) * 48;

            // vertical offset: near-center slightly up, farther cards progressively go down
            if (Math.abs(mapped) < 0.6) {
              y = -6 * Math.abs(mapped); // mild lift for near-center
            } else {
              y = Math.min(24, Math.abs(mapped) * 12); // further cards go down
            }
          }

          const isActive = i === active;
          const baseScale = Math.max(0.9, 1 - Math.abs(norm) * 0.02);
          let scale = baseScale;
          let opacity = 1;

          if (inputFocused) {
            if (isActive) {
              scale = 1.12;
              opacity = 1;
            } else {
              scale = Math.max(0.92, baseScale - 0.02);
              opacity = Math.abs(norm) <= 2 ? 0.75 : 0.45;
            }
          }

          const zIndex = isActive ? 400 : 220 - Math.abs(norm) * 8;
          // jeśli karta jest "flipped" dodajemy obrót 180deg do całego transformu kontenera .card
          const flipRotation = card.flipped ? " rotateY(180deg)" : "";
          const transform = `translateX(${x}px) translateY(${y}px) translateZ(${z}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})${flipRotation}`;

          return (
            <div
              key={i}
              className={`card ${isActive ? "active" : ""} ${card.flipped ? "flipped" : ""} ${card.counterRotated ? "flip-ready" : ""} ${card.buttonFlipped ? "buttons-flipped" : ""}`}
              ref={(el) => { cardRefs.current[i] = el || null; }}
              style={{
                transform,
                zIndex,
                opacity,
                transition: "transform 420ms cubic-bezier(.22,.15,.18,1), opacity 220ms",
                willChange: "transform, opacity",
              }}
            >
              <div className="card-inner">
                <span className="flip-toggle" style={{zIndex: 5}}>{card.buttonFlipped ? "Tył" : "Przód"}</span>

                <button
                    className="flip-btn"
                    onMouseDown={(e) => beginSuppress(e)}
                    onTouchStart={(e) => beginSuppress(e)}
                    onKeyDown={(ev) => { if (ev.key === " " || ev.key === "Enter") beginSuppress(ev); }}
                    onClick={(e) => toggleFlip(i, e)}
                    type="button"
                    aria-label="Flip card"
                >
                  <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
                </button>

                <div className="face front">
                  {isFan && !isActive && !inputFocused ? (
                    <div
                      className="preview"
                      onClick={() => setActive(i)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActive(i);
                        }
                      }}
                      aria-hidden={false}
                    >
                      <span className="preview-text">
                        {card[displayedFrontKey] || <span className="placeholder">{displayedFrontKey === "front" ? "Przód" : "Tył"}</span>}
                      </span>
                    </div>
                  ) : (
                      <input
                          ref={(el) => {
                            inputsRef.current[i] = inputsRef.current[i] || {};
                            // store physical front input under stable key 'front'
                            inputsRef.current[i].front = el || null;
                          }}
                          placeholder={displayedFrontKey === "front" ? "Przód" : "Tył"}
                          value={card[displayedFrontKey]}
                          onChange={(e) => updateCardText(i, displayedFrontKey, e.target.value)}
                          onFocus={() => handleInputFocusSide(i)}
                          onBlur={handleInputBlur}
                          className="seamless-input"
                      />
                  )}
                </div>

                <div className="face back">
                  {isFan && !isActive && !inputFocused ? (
                    <div
                      className="preview"
                      onClick={() => setActive(i)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActive(i);
                        }
                      }}
                      aria-hidden={false}
                    >
                      <span className="preview-text">
                        {card[displayedBackKey] || <span className="placeholder">{displayedBackKey === "front" ? "Przód" : "Tył"}</span>}
                      </span>
                    </div>
                  ) : (
                      <input
                          ref={(el) => {
                            inputsRef.current[i] = inputsRef.current[i] || {};
                            // store physical back input under stable key 'back'
                            inputsRef.current[i].back = el || null;
                          }}
                          placeholder={displayedBackKey === "front" ? "Przód" : "Tył"}
                          value={card[displayedBackKey]}
                          onChange={(e) => updateCardText(i, displayedBackKey, e.target.value)}
                          onFocus={() => handleInputFocusSide(i)}
                          onBlur={handleInputBlur}
                          className="seamless-input"
                      />
                   )}
                 </div>
               </div>
             </div>
           );
         })}
       </div>
        <div className="deck-controls" style={{width: "100%"}}>
          <button className={"deck-button delete-btn"} type="button" disabled={cards.length<=1} onClick={() => {
            setCards((prev) => {
              if (prev.length <= 1) return prev;
              const newCards = prev.filter((_, idx) => idx !== active);
              if (active >= newCards.length) {
                setActive(Math.max(0, newCards.length - 1));
              }
              return newCards;
            });
            setInputFocused(false);
          }} aria-label="Usuń kartę">
            <i className="bi bi-trash-fill" aria-hidden="true"></i>
            Usuń
          </button>
          <button
           className="deck-button add-btn"
           onMouseDown={(e) => beginSuppress(e)}
           onTouchStart={(e) => beginSuppress(e)}
           onKeyDown={(ev) => { if (ev.key === " " || ev.key === "Enter") beginSuppress(ev); }}
           onClick={addCard}
           aria-label="Dodaj kartę"
          >+
          </button>
          <button className={"deck-button save-btn"} type="button" onClick={(e) => handleSave(e)} aria-label="Zapisz talię">
            Zapisz
            <i className="bi bi-floppy-fill" aria-hidden="true"></i>
          </button>
        </div>

     </div>
   );
 }

 // helper: czy indeks jest aktywny (nie nadpisywać później)
 function isActiveIndex(i, active) {
   return i === active;
 }
