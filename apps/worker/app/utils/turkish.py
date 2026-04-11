import re
from typing import List

# Turkish-specific character mappings for normalization
TURKISH_CHAR_MAP = {
    "i": "i",
    "I": "\u0130",  # dotted capital I
    "\u0131": "\u0131",  # dotless i
    "\u0130": "\u0130",
}

# Turkish stop words
TURKISH_STOP_WORDS = frozenset(
    {
        "acaba",
        "altm\u0131\u015f",
        "alt\u0131",
        "ama",
        "ancak",
        "arada",
        "as\u0131l",
        "ayn\u0131",
        "baz\u0131",
        "belki",
        "ben",
        "benden",
        "beni",
        "benim",
        "beri",
        "be\u015f",
        "bile",
        "bir",
        "bir\u015fey",
        "bir\u015feyi",
        "birisi",
        "birkez",
        "birçok",
        "biri",
        "bir\u015fey",
        "bitmek",
        "biz",
        "bizden",
        "bize",
        "bizim",
        "bu",
        "buna",
        "bunda",
        "bundan",
        "bunlar",
        "bunlar\u0131",
        "bunlar\u0131n",
        "bunu",
        "bunun",
        "\u00e7abuk",
        "\u00e7ok",
        "\u00e7\u00fcnk\u00fc",
        "da",
        "daha",
        "de",
        "defa",
        "diye",
        "doksan",
        "dokuz",
        "dolay\u0131",
        "dolay\u0131s\u0131yla",
        "d\u00f6rt",
        "edecek",
        "eden",
        "ederek",
        "edilecek",
        "ediliyor",
        "edilmesi",
        "ediyor",
        "e\u011fer",
        "elli",
        "en",
        "etmesi",
        "etti",
        "etti\u011fi",
        "etti\u011fi",
        "gibi",
        "g\u00f6re",
        "hala",
        "hangi",
        "hani",
        "haric",
        "hatta",
        "hem",
        "hen\u00fcz",
        "hep",
        "hepsi",
        "her",
        "herhangi",
        "herkes",
        "herkesin",
        "hi\u00e7",
        "hi\u00e7bir",
        "i\u00e7in",
        "iki",
        "ile",
        "ilgili",
        "ise",
        "işte",
        "itibaren",
        "itibariyle",
        "kadar",
        "kar\u015f\u0131n",
        "katrilyon",
        "kendi",
        "kendilerine",
        "kendini",
        "kendisi",
        "kendisine",
        "kendisini",
        "kez",
        "ki",
        "kim",
        "kimden",
        "kime",
        "kimi",
        "kimse",
        "k\u0131rk",
        "milyar",
        "milyon",
        "mu",
        "m\u0131",
        "nas\u0131l",
        "ne",
        "neden",
        "nedenle",
        "nerde",
        "nerede",
        "nereye",
        "ni\u00e7in",
        "niye",
        "o",
        "olan",
        "olarak",
        "oldu",
        "oldu\u011fu",
        "olmad\u0131",
        "olmak",
        "olmas\u0131",
        "olmayan",
        "olmaz",
        "olsun",
        "olup",
        "olur",
        "on",
        "ona",
        "ondan",
        "onlar",
        "onlardan",
        "onlari",
        "onlar\u0131n",
        "onu",
        "onun",
        "otuz",
        "oysa",
        "pek",
        "ra\u011fmen",
        "sadece",
        "sanki",
        "sekiz",
        "seksen",
        "sen",
        "senden",
        "seni",
        "senin",
        "siz",
        "sizden",
        "sizi",
        "sizin",
        "sonra",
        "taraf\u0131ndan",
        "trilyon",
        "t\u00fcm",
        "\u00fc\u00e7",
        "uzere",
        "\u00fczere",
        "var",
        "ve",
        "veya",
        "ya",
        "yani",
        "yapacak",
        "yap\u0131lan",
        "yap\u0131lmas\u0131",
        "yapma",
        "yapt\u0131",
        "yapt\u0131\u011f\u0131",
        "yapmak",
        "yapt\u0131",
        "yedi",
        "yerine",
        "yetmi\u015f",
        "yine",
        "yirmi",
        "yoksa",
        "y\u00fcz",
        "zaten",
        "zira",
    }
)


def normalize_turkish(text: str) -> str:
    """Normalize Turkish text by handling special characters.

    Handles Turkish dotless i (i) and dotted I (I) correctly.
    """
    if not text:
        return ""

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Handle Turkish-specific characters
    # Convert uppercase dotted I to proper form
    text = text.replace("\u0130", "\u0130")
    # Ensure dotless i stays correct
    text = text.replace("\u0131", "\u0131")

    return text


def tokenize_turkish(text: str) -> List[str]:
    """Tokenize Turkish text into words.

    Handles Turkish punctuation and special characters.
    """
    if not text:
        return []

    text = normalize_turkish(text)

    # Split on whitespace and punctuation
    tokens = re.findall(r"[a-zA-Z\u00c0-\u024f\u011e\u011f\u0130\u0131\u00d6\u00f6\u015e\u015f\u00dc\u00fc]+", text.lower())

    return tokens


def remove_stop_words(tokens: List[str]) -> List[str]:
    """Remove Turkish stop words from token list.

    Args:
        tokens: List of tokens

    Returns:
        Filtered list without stop words
    """
    return [t for t in tokens if t.lower() not in TURKISH_STOP_WORDS]


def stem_turkish(word: str) -> str:
    """Basic Turkish stemming.

    Removes common suffixes from Turkish words.
    This is a simple heuristic, not a full stemmer.
    """
    if not word or len(word) < 4:
        return word

    word = word.lower()

    # Common Turkish suffixes to strip
    suffixes = [
        "lardan",
        "lerden",
        "larda",
        "lerde",
        "lardan",
        "lerden",
        "lar\u0131",
        "leri",
        "lar\u0131n",
        "lerin",
        "larla",
        "lerle",
        "larda",
        "lerde",
        "dan",
        "den",
        "dan",
        "den",
        "daki",
        "deki",
        "ca",
        "ce",
        "c\u0131",
        "ci",
        "cu",
        "c\u00fc",
        "lar",
        "ler",
        "siz",
        "su\u0308z",
        "lu",
        "l\u00fc",
        "li",
        "l\u0131",
        "lik",
        "l\u0131k",
        "luk",
        "l\u00fck",
        "dir",
        "dir",
        "tir",
        "tir",
        "mak",
        "mek",
        "yor",
        "mus",
        "mu\u015f",
        "maz",
        "mez",
    ]

    for suffix in suffixes:
        if word.endswith(suffix) and len(word) - len(suffix) >= 3:
            return word[: len(word) - len(suffix)]

    return word
