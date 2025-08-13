document.addEventListener('DOMContentLoaded', () => {
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
                    if (otherAnswer) {
                        otherAnswer.hidden = true;
                    }
                }
            });
            
            // Toggle the clicked FAQ
            question.setAttribute('aria-expanded', !expanded);
            const answerId = question.getAttribute('aria-controls');
            const answer = document.getElementById(answerId);
            if (answer) {
                answer.hidden = expanded;
            }
        });
    });
});
