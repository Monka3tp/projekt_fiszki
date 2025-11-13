// File: `src/components/CreateDeck.jsx`
import React, { useState, useRef, useEffect } from "react";
import "./CreateDeck.css";

export default function CreateDeck() {
  const [cards, setCards] = useState(() => [{ front: "", back: "", flipped: false }]);
  const [active, setActive] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [isFan, setIsFan] = useState(() => window.innerWidth > window.innerHeight || window.innerWidth >= 720);
  const inputsRef = useRef([]);
  const accRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, cards.length);
  }, [cards.length]);

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
    setActive((a) => clampIndex(a + steps));
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
    setCards((prev) => prev.map((c, idx) => (idx === i ? { ...c, flipped: !c.flipped } : c)));
  };

  const addCard = () => {
    const newIndex = cards.length;
    setCards((prev) => [...prev, { front: "", back: "", flipped: false }]);
    setActive(newIndex);
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

  const handleInputFocus = (i) => {
    setInputFocused(true);
    setActive(i);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      const activeEl = document.activeElement;
      const stillInput = inputsRef.current.some((el) => el === activeEl);
      if (!stillInput) setInputFocused(false);
    }, 0);
  };

  const mapNorm = (n) => {
    const pow = 0.85;
    return Math.sign(n) * Math.pow(Math.abs(n), pow);
  };

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
          let rotateZ = isFan ? angleDeg * 0.35 : angleDeg * 0.7;

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
          const transform = `translateX(${x}px) translateY(${y}px) translateZ(${z}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;

          return (
            <div
              key={i}
              className={`card ${isActive ? "active" : ""}`}
              style={{
                transform,
                zIndex,
                opacity,
                transition: "transform 420ms cubic-bezier(.22,.9,.18,1), opacity 220ms",
                willChange: "transform, opacity",
              }}
            >
              <div className={`card-inner ${card.flipped ? "flipped" : ""}`}>
                <span className="flip-toggle" aria-hidden="true">{card.flipped ? "Tył" : "Przód"}</span>

                <button
                    className="flip-btn"
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
                        {card.front || <span className="placeholder">Przód</span>}
                      </span>
                    </div>
                  ) : (
                      <input
                          ref={(el) => {
                            if (isActive) {
                              inputsRef.current[i] = el;
                            } else if (inputsRef.current[i]) {
                              inputsRef.current[i] = null;
                            }
                          }}
                          placeholder="Przód"
                          value={card.front}
                          onChange={(e) => updateCardText(i, "front", e.target.value)}
                          onFocus={() => handleInputFocus(i)}
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
                        {card.back || <span className="placeholder">Tył</span>}
                      </span>
                    </div>
                  ) : (
                      <input
                          ref={(el) => {
                            if (isActive) {
                              inputsRef.current[i] = el;
                            } else if (inputsRef.current[i]) {
                              inputsRef.current[i] = null;
                            }
                          }}
                          placeholder="Tył"
                          value={card.back}
                          onChange={(e) => updateCardText(i, "back", e.target.value)}
                          onFocus={() => handleInputFocus(i)}
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

      <button className="add-btn" onClick={addCard} aria-label="Dodaj kartę">+</button>
    </div>
  );
}

// helper: czy indeks jest aktywny (nie nadpisywać później)
function isActiveIndex(i, active) {
  return i === active;
}
