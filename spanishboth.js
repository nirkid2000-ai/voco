const data = {
  words: [
    { ans: { en: "city", he: "עיר" }, q: "ciudad", level: "A2" },
    { ans: { en: "country", he: "מדינה" }, q: "país", level: "A2" },
    { ans: { en: "street", he: "רחוב" }, q: "calle", level: "A2" },
    { ans: { en: "building", he: "בניין" }, q: "edificio", level: "A2" },
    { ans: { en: "square (plaza)", he: "כיכר" }, q: "plaza", level: "A2" },

    { ans: { en: "restaurant", he: "מסעדה" }, q: "restaurante", level: "A2" },
    { ans: { en: "menu", he: "תפריט" }, q: "menú", level: "A2" },
    { ans: { en: "breakfast", he: "ארוחת בוקר" }, q: "desayuno", level: "A2" },
    { ans: { en: "lunch", he: "ארוחת צהריים" }, q: "almuerzo", level: "A2" },
    { ans: { en: "dinner", he: "ארוחת ערב" }, q: "cena", level: "A2" },

    { ans: { en: "train", he: "רכבת" }, q: "tren", level: "A2" },
    { ans: { en: "bus", he: "אוטובוס" }, q: "autobús", level: "A2" },
    {
      ans: { en: "ticket office", he: "קופת כרטיסים" },
      q: "taquilla",
      level: "A2",
    },
    { ans: { en: "schedule", he: "לוח זמנים" }, q: "horario", level: "A2" },
    { ans: { en: "trip", he: "טיול" }, q: "viaje", level: "A2" },

    { ans: { en: "friend", he: "חבר" }, q: "amigo", level: "A2" },
    { ans: { en: "neighbor", he: "שכן" }, q: "vecino", level: "A2" },
    { ans: { en: "guest", he: "אורח" }, q: "invitado", level: "A2" },
    { ans: { en: "people", he: "אנשים" }, q: "gente", level: "A2" },
    { ans: { en: "group", he: "קבוצה" }, q: "grupo", level: "A2" },

    { ans: { en: "week", he: "שבוע" }, q: "semana", level: "A2" },
    { ans: { en: "month", he: "חודש" }, q: "mes", level: "A2" },
    { ans: { en: "year", he: "שנה" }, q: "año", level: "A2" },
    { ans: { en: "morning", he: "בוקר" }, q: "mañana", level: "A2" },
    { ans: { en: "evening", he: "ערב" }, q: "tarde", level: "A2" },

    { ans: { en: "before", he: "לפני" }, q: "antes", level: "A2" },
    { ans: { en: "after", he: "אחרי" }, q: "después", level: "A2" },
    { ans: { en: "during", he: "במהלך" }, q: "durante", level: "A2" },
    { ans: { en: "because", he: "כי" }, q: "porque", level: "A2" },
    { ans: { en: "although", he: "למרות ש" }, q: "aunque", level: "A2" },

    { ans: { en: "important", he: "חשוב" }, q: "importante", level: "A2" },
    { ans: { en: "different", he: "שונה" }, q: "diferente", level: "A2" },
    { ans: { en: "same", he: "אותו דבר" }, q: "mismo", level: "A2" },
    { ans: { en: "busy", he: "עסוק" }, q: "ocupado", level: "A2" },
    { ans: { en: "free (available)", he: "פנוי" }, q: "libre", level: "A2" },

    { ans: { en: "to buy", he: "לקנות" }, q: "comprar", level: "A2" },
    { ans: { en: "to sell", he: "למכור" }, q: "vender", level: "A2" },
    { ans: { en: "to pay", he: "לשלם" }, q: "pagar", level: "A2" },
    { ans: { en: "to choose", he: "לבחור" }, q: "elegir", level: "A2" },
    { ans: { en: "to use", he: "להשתמש" }, q: "usar", level: "A2" },

    { ans: { en: "to open", he: "לפתוח" }, q: "abrir", level: "A2" },
    { ans: { en: "to close", he: "לסגור" }, q: "cerrar", level: "A2" },
    { ans: { en: "to begin", he: "להתחיל" }, q: "empezar", level: "A2" },
    { ans: { en: "to end", he: "לסיים" }, q: "terminar", level: "A2" },
    { ans: { en: "to return", he: "לחזור" }, q: "volver", level: "A2" },

    { ans: { en: "quickly", he: "מהר" }, q: "rápidamente", level: "A2" },
    { ans: { en: "slowly", he: "לאט" }, q: "lentamente", level: "A2" },
    { ans: { en: "well", he: "טוב" }, q: "bien", level: "A2" },
    { ans: { en: "badly", he: "רע" }, q: "mal", level: "A2" },

    { ans: { en: "to think", he: "לחשוב" }, q: "pensar", level: "A2" },
    { ans: { en: "to believe", he: "להאמין" }, q: "creer", level: "A2" },
    { ans: { en: "to remember", he: "לזכור" }, q: "recordar", level: "A2" },
    { ans: { en: "to forget", he: "לשכוח" }, q: "olvidar", level: "A2" },

    { ans: { en: "to bring", he: "להביא" }, q: "traer", level: "A2" },
    { ans: { en: "to take", he: "לקחת" }, q: "llevar", level: "A2" },
    { ans: { en: "to show", he: "להראות" }, q: "mostrar", level: "A2" },
    { ans: { en: "to explain", he: "להסביר" }, q: "explicar", level: "A2" },

    { ans: { en: "to wait", he: "לחכות" }, q: "esperar", level: "A2" },
    { ans: { en: "to happen", he: "לקרות" }, q: "pasar", level: "A2" },
    { ans: { en: "to help", he: "לעזור" }, q: "ayudar", level: "A2" },
    { ans: { en: "to try", he: "לנסות" }, q: "intentar", level: "A2" },
  ],
};

export default data;
