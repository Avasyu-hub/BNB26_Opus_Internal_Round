"""Multilingual Pedagogical Templates & Translation Prompts (W5).
Supports English (en), Hindi (hi), and Bengali (bn) for all 6 misconceptions.
Preserves algebraic expressions and variables while localizing pedagogical explanations.
"""
from typing import Any, Dict

# High-quality calibrated pedagogical explanations referencing dynamic numbers
MULTILINGUAL_EXPLANATIONS: Dict[str, Dict[str, str]] = {
    "PARTIAL_DISTRIBUTION": {
        "en": (
            "When multiplying a factor across parentheses like {factor}({term1} + {term2}), "
            "the multiplier must scale every term inside the group. In your working, {factor} was "
            "distributed to {term1} to produce {factor}{term1}, but {term2} was left unmultiplied instead of {product}. "
            "Geometrically, think of a rectangle with width {factor} split into two parts: you accounted for one section "
            "but omitted the area of the second piece."
        ),
        "hi": (
            "जब आप कोष्ठक (parentheses) के बाहर किसी संख्या {factor} से गुणा करते हैं, जैसे {factor}({term1} + {term2}), "
            "तो उस संख्या का गुणा कोष्ठक के अंदर के प्रत्येक पद से होना चाहिए। आपने {factor} को {term1} से गुणा करके {factor}{term1} लिखा, "
            "परंतु {term2} को बिना गुणा किए छोड़ दिया जबकि यह {product} होना चाहिए था। "
            "क्षेत्रफल मॉडल (Area Model) के अनुसार, इसका अर्थ है कि आपने आयत के एक हिस्से का क्षेत्रफल छोड़ दिया।"
        ),
        "bn": (
            "যখন বন্ধনীর (parentheses) বাইরে কোনো সংখ্যা {factor} দিয়ে গুণ করা হয়, যেমন {factor}({term1} + {term2}), "
            "তখন বন্ধনীর ভেতরের প্রতিটি পদের সাথেই গুণ করতে হয়। আপনি {factor} কে {term1} দিয়ে গুণ করে {factor}{term1} লিখেছেন, "
            "কিন্তু {term2} কে গুণ না করে রেখে দিয়েছেন, যা হওয়া উচিত ছিল {product}। "
            "জ্যামিতিক ক্ষেত্রফল মডেল দিয়ে দেখলে বোঝা যায়, আপনি আয়তক্ষেত্রের দ্বিতীয় অংশের ক্ষেত্রফলটি বাদ দিয়ে ফেলেছেন।"
        ),
    },
    "SQUARE_OF_SUM": {
        "en": (
            "Expanding the square of a sum ({term1} + {term2})² is not simply squaring each term individually. "
            "While {term1}² and {term2}² represent the two corner squares, the expansion also creates two rectangular "
            "overlap regions of area {term1} · {term2}, giving the middle term 2·{term1}·{term2}. "
            "Without this middle term {middle_term}, the total geometric area of the expanded square remains incomplete."
        ),
        "hi": (
            "({term1} + {term2})² का विस्तार करने का अर्थ केवल दोनों पदों का अलग-अलग वर्ग करना नहीं है। "
            "यद्यपि {term1}² और {term2}² दोनों कोनों के वर्ग दर्शाते हैं, इस विस्तार में दो आयताकार भाग भी बनते हैं "
            "जिनका कुल क्षेत्रफल 2·{term1}·{term2} यानी {middle_term} होता है। "
            "इस मध्य पद {middle_term} के बिना पूरे ज्यामितीय वर्ग का क्षेत्रफल अधूरा रह जाता है।"
        ),
        "bn": (
            "({term1} + {term2})² এর বিস্তার মানে শুধুমাত্র আলাদাভাবে পদগুলোর বর্গ করা নয়। "
            "{term1}² এবং {term2}² দুটি কোণার বর্গ তৈরি করলেও, জ্যামিতিক চিত্রে আরও দুটি আয়তক্ষেত্র থাকে "
            "যাদের ক্ষেত্রফল 2·{term1}·{term2} অর্থাৎ {middle_term}। "
            "এই মধ্যপদ {middle_term} বাদ দিলে সম্পূর্ণ জ্যামিতিক বর্গের ক্ষেত্রফল অসম্পূর্ণ থেকে যায়।"
        ),
    },
    "NEGATIVE_DISTRIBUTION": {
        "en": (
            "A negative sign in front of parentheses like -({term1} + {term2}) applies a directional reversal to the entire quantity. "
            "While you correctly inverted the sign of {term1} to -{term1}, the negative sign must also invert {term2} into -{term2}. "
            "On a number line, taking the negative of a forward step followed by another forward step reverses both movements backward."
        ),
        "hi": (
            "कोष्ठक के बाहर ऋण चिह्न (-) जैसे -({term1} + {term2}) का अर्थ है पूरी राशि की दिशा को उलटना। "
            "आपने {term1} का चिह्न बदलकर -{term1} तो सही किया, परंतु ऋण चिह्न {term2} को भी बदलकर -{term2} बनाएगा। "
            "संख्या रेखा पर, आगे की ओर उठाए गए दोनों कदमों के पूरे सफर को उलटने का अर्थ है कि दोनों ही कदम पीछे की दिशा में जाएंगे।"
        ),
        "bn": (
            "বন্ধনীর সামনে বিয়োগ চিহ্ন (-) যেমন -({term1} + {term2}) থাকা মানে পুরো রাশির দিক বিপরীত করা। "
            "আপনি {term1} এর চিহ্ন পরিবর্তন করে -{term1} সঠিক করেছেন, তবে বিয়োগ চিহ্নটি {term2} এর চিহ্নকেও বদলে -{term2} করবে। "
            "সংখ্যারেখায়, সামনের দিকে নেওয়া দুটি পদক্ষেপের সম্পূর্ণ ভ্রমণ বিপরীত করার অর্থ উভয় পদক্ষেপই পেছনের দিকে সরে যাবে।"
        ),
    },
    "TRANSPOSITION": {
        "en": (
            "In an equation, an equals sign acts like a balanced scale between the left and right sides. "
            "When moving +{term} across the equals sign to isolate the variable, you must subtract {term} from both sides to maintain equilibrium. "
            "Keeping it as +{term} adds weight to the scale instead of removing it, which distorts the balance of the equation."
        ),
        "hi": (
            "किसी समीकरण में बराबर का चिह्न (=) तराजू के दोनों पलड़ों के संतुलन की तरह होता है। "
            "चर राशि (variable) को अकेला करने के लिए जब आप +{term} को दूसरी ओर ले जाते हैं, तो संतुलन बनाए रखने के लिए दोनों पक्षों से {term} घटाना पड़ता है। "
            "इसे +{term} के रूप में ही छोड़ देने से पलड़े का संतुलन बिगड़ जाता है और समीकरण गलत हो जाता है।"
        ),
        "bn": (
            "একটি সমীকরণে সমান চিহ্ন (=) দাঁড়িপাল্লার দুটি দিকের ভারসাম্যের মতো কাজ করে। "
            "চলকটিকে আলাদা করতে যখন আপনি +{term} কে সমান চিহ্নের অন্য পাশে নিয়ে যান, তখন ভারসাম্য বজায় রাখতে উভয় পাশ থেকে {term} বিয়োগ করতে হয়। "
            "চিহ্ন পরিবর্তন না করে +{term} রেখে দিলে দাঁড়িপাল্লার ভারসাম্য নষ্ট হয়ে যায় এবং সমীকরণটি ভুল হয়ে যায়।"
        ),
    },
    "UNLIKE_TERMS": {
        "en": (
            "Terms with variables like {term1} and constant numbers like {term2} represent completely different mathematical units. "
            "You cannot combine {term1} and {term2} into a single term like {wrong_combined}, just as you cannot add 3 meters and 5 seconds into 8 meter-seconds. "
            "Because {term1} changes value depending on the unknown while {term2} is fixed, they must remain written side-by-side as distinct terms."
        ),
        "hi": (
            "चर राशि वाले पद जैसे {term1} और अचर संख्याएँ जैसे {term2} पूरी तरह से अलग-अलग इकाइयाँ दर्शाते हैं। "
            "आप {term1} और {term2} को जोड़कर {wrong_combined} नहीं लिख सकते, ठीक वैसे ही जैसे 3 मीटर और 5 सेकंड को जोड़कर 8 मीटर-सेकंड नहीं कहा जा सकता। "
            "चूंकि {term1} का मान अज्ञात पर निर्भर करता है जबकि {term2} स्थिर है, इसलिए इन्हें अलग-अलग ही लिखा जाना चाहिए।"
        ),
        "bn": (
            "চলকযুক্ত পদ যেমন {term1} এবং ধ্রুবক সংখ্যা যেমন {term2} সম্পূর্ণ ভিন্ন ধরনের একক নির্দেশ করে। "
            "আপনি {term1} এবং {term2} যোগ করে {wrong_combined} লিখতে পারেন না, ঠিক যেমন ৩ মিটার এবং ৫ সেকেন্ড যোগ করে ৮ মিটার-সেকেন্ড বলা যায় না। "
            "যেহেতু {term1} এর মান অজানা চলকের ওপর নির্ভরশীল আর {term2} নির্দিষ্ট, তাই এদের আলাদা পদ হিসেবেই পাশাপাশি রাখতে হবে।"
        ),
    },
    "NEG_TIMES_NEG": {
        "en": (
            "Multiplying two negative numbers produces a positive result because multiplying by a negative inverts the direction on a number line. "
            "When evaluating ({factor1}) · ({factor2}), the first negative establishes a negative rate, and the second negative reverses time or direction, bringing you back to the positive side (+{positive_product}). "
            "Assigning a negative value like {negative_product} fails to account for this double direction reversal."
        ),
        "hi": (
            "दो ऋणात्मक (negative) संख्याओं का गुणनफल हमेशा धनात्मक (positive) होता है, क्योंकि ऋणात्मक संख्या से गुणा करने पर संख्या रेखा पर दिशा उलट जाती है। "
            "({factor1}) · ({factor2}) में, पहला ऋण एक दर को दर्शाता है और दूसरा ऋण दिशा को पुनः पलट देता है, जिससे परिणाम धनात्मक (+{positive_product}) हो जाता है। "
            "इसे ऋणात्मक ({negative_product}) लिखना दो बार दिशा पलटने के नियम का उल्लंघन करता है।"
        ),
        "bn": (
            "দুটি ঋণাত্মক (negative) সংখ্যার গুণফল সর্বদা ধনাত্মক (positive) হয়, কারণ ঋণাত্মক সংখ্যা দিয়ে গুণ করলে সংখ্যারেখায় দিক উল্টে যায়। "
            "({factor1}) · ({factor2}) এর ক্ষেত্রে, প্রথম ঋণাত্মক মানটি একটি বিপরীত হার বোঝায় এবং দ্বিতীয় ঋণাত্মক মানটি দিককে পুনরায় উল্টে দেয়, ফলে ফলাফল ধনাত্মক (+{positive_product}) হয়। "
            "ফলাফল ঋণাত্মক ({negative_product}) লিখলে এই দুইবার দিক পরিবর্তনের নিয়মটি উপেক্ষিত হয়।"
        ),
    },
}


def get_localized_explanation(
    label: str,
    language: str,
    params: Dict[str, Any],
) -> str:
    """Retrieve formatted localized explanation with fallback to English."""
    lang = language.lower() if language in ("en", "hi", "bn") else "en"
    templates = MULTILINGUAL_EXPLANATIONS.get(label, {})
    template = templates.get(lang, templates.get("en", "Mathematical equivalence was violated at this step."))

    try:
        return template.format(**params)
    except KeyError:
        # Fallback with safe defaults
        return templates.get("en", "Mathematical equivalence was violated at this step.")
