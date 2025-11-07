
const removeSpecialChars = (str) => {
    return str
        .replace(/ą/g, "a")
        .replace(/ę/g, "e")
        .replace(/ć/g, "c")
        .replace(/ł/g, "l")
        .replace(/ń/g, "n")
        .replace(/ó/g, "o")
        .replace(/ś/g, "s")
        .replace(/ź/g, "z")
        .replace(/ż/g, "z")
}

const makeSlug = (str) => {
    return removeSpecialChars(str)
        .toLowerCase()
        .replace("jezyk ", "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
    }

export { makeSlug };