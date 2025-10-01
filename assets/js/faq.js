document.addEventListener("DOMContentLoaded", () => {
    // --- FAQ Toggle Logic ---
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const expanded = question.getAttribute('aria-expanded') === 'true';

            // Close all other FAQs first
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    const otherAnswerId = otherQuestion.getAttribute('aria-controls');
                    const otherAnswer = document.getElementById(otherAnswerId);
                    if (otherAnswer) otherAnswer.hidden = true;
                }
            });

            // Toggle the clicked FAQ
            question.setAttribute('aria-expanded', !expanded);
            const answerId = question.getAttribute('aria-controls');
            const answer = document.getElementById(answerId);
            if (answer) answer.hidden = expanded;
        });
    });

    // --- JSON-LD FAQ Schema Generator ---
    const faqItems = document.querySelectorAll(".faq-item");
    if (faqItems.length > 0) {
        let faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": []
        };

        faqItems.forEach(item => {
            const questionEl = item.querySelector(".faq-question span");
            const answerEl = item.querySelector(".faq-answer");
            if (questionEl && answerEl) {
                faqSchema.mainEntity.push({
                    "@type": "Question",
                    "name": questionEl.textContent.trim(),
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answerEl.innerHTML.trim()
                    }
                });
            }
        });

        // Remove old schema if exists
        const oldScript = document.getElementById("faq-schema");
        if (oldScript) oldScript.remove();

        // Inject JSON-LD into <head>
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "faq-schema";
        script.textContent = JSON.stringify(faqSchema, null, 2);
        document.head.appendChild(script);
    }
});
