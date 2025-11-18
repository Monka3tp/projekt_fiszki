// javascript
// src/services/deckService.js
import { db } from "../firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    getDoc,
    Timestamp
} from "firebase/firestore";

const decksCol = collection(db, "decks");

export function createDeck(uid, payload) {
    return addDoc(decksCol, { ...payload, ownerId: uid, createdAt: Timestamp.fromDate(new Date()) });
}

export function updateDeck(id, payload) {
    const ref = doc(db, "decks", id);
    return updateDoc(ref, { ...payload, updatedAt: new Date() });
}

export async function getDeckById(id) {
    const ref = doc(db, "decks", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
    } else {
        throw new Error("Deck not found");
    }
}

export function getPublicDecks(setter) {
    const q = query(decksCol, where("visible", "==", "public"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) =>
        setter(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
}

export function getUserDecks(uid, setter) {
    const q = query(decksCol, where("ownerId", "==", uid), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) =>
        setter(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
}
