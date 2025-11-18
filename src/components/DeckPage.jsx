// javascript
// file: 'src/components/DeckPage.jsx'
import {useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./EditDeck.css";
import "./DeckPage.css"
import {stockFlashcards} from "../data/stockFlashcards.jsx";
import {getDeckById} from "../services/deckService.js";

function makeUid() {
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;
}

function DeckPage() {
    const categoryId = useParams().categoryId || null;
    const deckId = useParams().deckId || null;
    const isStock = categoryId !== null && deckId !== null;
    const [deck, setDeck] = useState({});
    const flipTimeouts = useRef({});
    const accRef = useRef(0);
    const rafRef = useRef(null);
    const [active, setActive] = useState(0);
    const [cards, setCards] = useState(() => [{
        front: "",
        back: "",
        flipped: false,
        displayedSide: "front",
        counterRotated: false,
        buttonFlipped: false,
        uid: makeUid()
    }]);
    const [_learnedCards, setLearnedCards] = useState([]);

    const wrapperRef = useRef(null);

    // swipe state
    const [swipeOffset, setSwipeOffset] = useState(0);
    const swipeRef = useRef({startX: 0, lastX: 0, startT: 0, horiz: false, dragging: false});
    const [swipeAnimating, setSwipeAnimating] = useState(false);
    const swipeCommitRef = useRef(null);

    // zamrożony active podczas leaving, żeby nowy active nie animował się bocznie
    const pendingActiveRef = useRef(null);

    useEffect(() => {
        if (isStock) {
            const key = `${categoryId}_${deckId}`;
            setDeck(stockFlashcards[key]);
        } else {
            getDeckById(deckId).then(fetchedDeck => {
                setDeck(fetchedDeck || {});
            }).catch(err => {
                console.error("Error fetching deck:", err);
            });
        }
    }, [categoryId, deckId, isStock]);

    useEffect(() => {
        if (!deck || !deck.cards) return;
        setCards(deck.cards.map(card => ({
            ...card,
            flipped: false,
            displayedSide: "front",
            counterRotated: false,
            buttonFlipped: false,
            uid: card.uid || makeUid()
        })));
    }, [deck]);

    useEffect(() => {
        if (wrapperRef.current && typeof wrapperRef.current.focus === "function") {
            wrapperRef.current.focus();
        }
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

    const onTouchStart = (e) => {
        const t = e.touches[0];
        swipeRef.current.startX = t.clientX;
        swipeRef.current.lastX = t.clientX;
        swipeRef.current.startT = Date.now();
        swipeRef.current.horiz = false;
        swipeRef.current.dragging = true;
        setSwipeAnimating(false);
        // nowy drag -> oczyść pending (jeśli nie commitujemy)
        pendingActiveRef.current = null;
    };

    const onTouchMove = (e) => {
        if (!swipeRef.current.dragging) return;
        const t = e.touches[0];
        const dx = t.clientX - swipeRef.current.startX;
        const absDx = Math.abs(dx);

        if (!swipeRef.current.horiz && absDx > 10) {
            swipeRef.current.horiz = true;
        }

        if (swipeRef.current.horiz) {
            setSwipeOffset(dx);
            e.preventDefault();
        }
        swipeRef.current.lastX = t.clientX;
    };

    const finalizeSwipeCommit = (direction) => {
        const card = cards[active];
        if (!card) {
            // safety: clear pending
            pendingActiveRef.current = null;
            swipeCommitRef.current = null;
            setSwipeAnimating(false);
            setSwipeOffset(0);
            return;
        }

        if (direction > 0) {
            setLearnedCards((prev) => [...prev, card]);
            setCards((prev) => prev.filter(c => c.uid !== card.uid));
        } else {
            setCards((prev) => {
                const without = prev.filter(c => c.uid !== card.uid);
                return [...without, card];
            });
        }

        // po aktualizacji kart zdejmujemy "pending" i ustawiamy właściwy active
        setTimeout(() => {
            setActive((prev) => clampIndex(prev));
            pendingActiveRef.current = null;
            setSwipeOffset(0);
            setSwipeAnimating(false);
            swipeCommitRef.current = null;
        }, 60);
    };

    const onTouchEnd = () => {
        if (!swipeRef.current.dragging) return;
        swipeRef.current.dragging = false;
        const dx = swipeRef.current.lastX - swipeRef.current.startX;
        const dt = Math.max(1, Date.now() - swipeRef.current.startT);
        const velocity = dx / dt;
        const threshold = 120;
        if (swipeRef.current.horiz && Math.abs(dx) > threshold) {
            const dir = dx > 0 ? 1 : -1;
            // zamrażamy aktywną kartę wizualnie na czas leaving
            pendingActiveRef.current = active;
            swipeCommitRef.current = dir;
            setSwipeAnimating(true);
            setSwipeOffset(dir * ((window.innerWidth || 800) * 0.6));
            setTimeout(() => finalizeSwipeCommit(dir), 420);
        } else if (swipeRef.current.horiz && Math.abs(velocity) > 0.35 && Math.abs(dx) > 30) {
            const dir = velocity > 0 ? 1 : -1;
            pendingActiveRef.current = active;
            swipeCommitRef.current = dir;
            setSwipeAnimating(true);
            setSwipeOffset(dir * ((window.innerWidth || 800) * 0.6));
            setTimeout(() => finalizeSwipeCommit(dir), 420);
        } else {
            // anulowanie swipe — krótszy powrót
            setSwipeAnimating(true);
            setSwipeOffset(0);
            setTimeout(() => {
                setSwipeAnimating(false);
            }, 220);
        }
    };

    const toggleFlip = (i, e) => {
        e.stopPropagation();
        const curCardSnapshot = cards[i] || {
            front: "",
            back: "",
            flipped: false,
            displayedSide: "front",
            counterRotated: false
        };
        const intendedFlipped = !curCardSnapshot.flipped;
        setCards((prev) => prev.map((c, idx) => (idx === i ? {
            ...c,
            flipped: intendedFlipped,
            counterRotated: curCardSnapshot.flipped,
            buttonFlipped: curCardSnapshot.flipped
        } : c)));
        if (flipTimeouts.current[i]) {
            clearTimeout(flipTimeouts.current[i]);
            delete flipTimeouts.current[i];
        }
        const midMs = 120;
        const intendedDisplayed = intendedFlipped ? "back" : "front";
        flipTimeouts.current[i] = setTimeout(() => {
            setCards((prev) =>
                prev.map((c, idx) => (idx === i ? {
                    ...c,
                    displayedSide: intendedDisplayed,
                    counterRotated: intendedFlipped,
                    buttonFlipped: intendedFlipped
                } : c))
            );
            delete flipTimeouts.current[i];
        }, midMs);
    };

    const animateSwipeByKey = (dir) => {
        if (!cards.length) return;
        // zamrażamy active podczas animacji klawiszowej
        pendingActiveRef.current = active;
        swipeCommitRef.current = dir;
        setSwipeAnimating(true);
        setSwipeOffset(dir * ((window.innerWidth || 800) * 0.6));
        setTimeout(() => finalizeSwipeCommit(dir), 420);
    };

    return (
        <div className={"deck-page"}>
            <i className="side-icon learned-icon bi bi-mortarboard-fill"></i>
            <i className="side-icon not-learned-icon bi bi-x"></i>

            <div
                ref={wrapperRef}
                tabIndex={0}
                className={"deck-wrap"}
                onWheel={onWheel}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") {
                        animateSwipeByKey(-1);
                    } else if (e.key === "ArrowRight") {
                        animateSwipeByKey(1);
                    }
                }}
                style={{touchAction: "pan-y"}}
            >
                <div className="wheel" style={{transformStyle: "preserve-3d"}}>
                    {cards.map((card, i) => {
                        const displayedFrontKey = card.displayedSide || "front";
                        const flipRotation = card.flipped ? " rotateY(180deg)" : "";

                        // jeśli trwa commit, używamy pendingActiveRef jako "zamrożonego" aktywnego indexu
                        const effectiveActive = (swipeCommitRef.current != null && pendingActiveRef.current != null) ? pendingActiveRef.current : active;
                        const offset = i - effectiveActive;

                        // tx tylko dla effective active
                        const tx = (i === effectiveActive) ? swipeOffset : 0;

                        const rotateZ = (i === effectiveActive) ? (tx / 20) : 0;
                        const activeTranslateY = (i === effectiveActive) ? (-Math.min(40, Math.abs(tx) / 12)) : 0;

                        // commit width i progress bazują na swipeOffset globalnie
                        const commitWidth = (window.innerWidth || 800) * 0.6;
                        const rawProgress = commitWidth ? Math.min(1, Math.abs(swipeOffset) / commitWidth) : 0;

                        // ruch jest aktywny podczas dragowania lub podczas commit animacji
                        const dragging = !!swipeRef.current.dragging;
                        const commitRunning = swipeAnimating && (swipeCommitRef.current != null);
                        const moveProgress = (dragging || commitRunning) ? rawProgress : 0;

                        // inne karty przesuwają się w górę proporcjonalnie do progressu (tylko te "za" active)
                        const baseRelativeY = offset * 10;
                        const shiftPer = 34;
                        const nonActiveTranslateY = (i === effectiveActive) ? activeTranslateY : (baseRelativeY - (offset > 0 ? shiftPer * moveProgress : 0));
                        const translateY = nonActiveTranslateY;

                        const baseOpacity = i === effectiveActive ? Math.max(0.3, 1 - Math.abs(tx) / ((window.innerWidth || 800))) : 1 - Math.min(0.6, Math.abs(offset) * 0.08);

                        const transform = `translateX(${tx}px) translateY(${translateY}px) translateZ(-${Math.abs(offset) * 10}px) rotateZ(${rotateZ}deg) ${flipRotation}`;
                        const isActive = i === effectiveActive;
                        const zIndex = isActive ? 400 : 220 - Math.abs(offset) * 8;

                        // transitions: during drag active follows finger (no transition), during commit keep other cards instant to avoid sideways motion
                        let transitionForThis;
                        if (isActive) {
                            if (dragging) {
                                transitionForThis = "transform 0ms, opacity 120ms";
                            } else if (commitRunning) {
                                transitionForThis = "transform 420ms cubic-bezier(.22,.9,.18,1), opacity 220ms";
                            } else {
                                transitionForThis = "transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms";
                            }
                        } else {
                            if (commitRunning) {
                                // podczas leaving niech inne karty nie animują bocznie — zero transition dla transform
                                transitionForThis = "transform 0ms, opacity 220ms";
                            } else if (dragging) {
                                // podczas dragowania dajemy krótkie przejście dla płynności
                                transitionForThis = "transform 120ms ease-out, opacity 180ms";
                            } else {
                                transitionForThis = "transform 420ms cubic-bezier(.22,.15,.18,1), opacity 220ms";
                            }
                        }

                        return (
                            <div
                                key={card.uid}
                                className={`card ${isActive ? "active" : ""} ${card.flipped ? "flipped" : ""} ${card.counterRotated ? "flip-ready" : ""} ${card.buttonFlipped ? "buttons-flipped" : ""}`}
                                style={{
                                    transform,
                                    zIndex,
                                    opacity: baseOpacity,
                                    transition: transitionForThis,
                                    willChange: "transform, opacity",
                                }}
                            >
                                <div className="card-inner">
                                    <span className="flip-toggle" style={{zIndex: 5}}>{card.buttonFlipped ? "Tył" : "Przód"}</span>

                                    <button
                                        className="flip-btn"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onTouchStart={(e) => e.preventDefault()}
                                        onClick={(e) => toggleFlip(i, e)}
                                        type="button"
                                        aria-label="Flip card"
                                    >
                                        <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
                                    </button>

                                    <div className="face front">
                                        <div className="preview" style={{pointerEvents: isActive ? "auto" : "none"}}>
                                            <span className="preview-text">{card[displayedFrontKey]}</span>
                                        </div>
                                    </div>

                                    <div className="face back">
                                        <div className="preview" style={{pointerEvents: isActive ? "auto" : "none"}}>
                                            <span className="preview-text">{card.back}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default DeckPage;
