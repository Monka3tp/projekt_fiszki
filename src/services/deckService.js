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
} from "firebase/firestore";

const decksCol = collection(db, "decks");

export function createDeck(uid, payload) {
    return addDoc(decksCol, { ...payload, owner: uid, createdAt: new Date() });
}

export function updateDeck(id, payload) {
    const ref = doc(db, "decks", id);
    return updateDoc(ref, { ...payload, updatedAt: new Date() });
}

export function getPublicDecks(setter) {
    const q = query(decksCol, where("visible", "==", "public"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) =>
        setter(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
}

export function getUserDecks(uid, setter) {
    const q = query(decksCol, where("owner", "==", uid), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) =>
        setter(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
}
