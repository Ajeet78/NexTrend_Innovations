document.addEventListener('DOMContentLoaded', () => {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const expanded = question.getAttribute('aria-expanded') === 'true';
            question.setAttribute('aria-expanded', !expanded);
            const answerId = question.getAttribute('aria-controls');
            const answer = document.getElementById(answerId);
            if (answer) {
                if (expanded) {
                    answer.hidden = true;
                } else {
                    answer.hidden = false;
                }
            }
        });
    });
});
