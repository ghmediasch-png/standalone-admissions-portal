document.addEventListener("DOMContentLoaded", function() {
    // --- ADVANCED NESTED FAQ TOGGLE SCRIPT ---
    const allQuestions = document.querySelectorAll('.faq-page-section .faq-question');

    allQuestions.forEach(question => {
        question.addEventListener('click', function () {
            // Find the direct parent item (.faq-item or .faq-item-main)
            const parentItem = this.closest('.faq-item, .faq-item-main');
            if (!parentItem) return;

            const answer = this.nextElementSibling;
            const isActive = parentItem.classList.contains('active');

            // Find the container to close siblings within the same level
            const container = parentItem.parentElement;

            // Close all sibling items at the same level
            container.querySelectorAll(':scope > .faq-item, :scope > .faq-item-main').forEach(sibling => {
                if (sibling !== parentItem && sibling.classList.contains('active')) {
                    sibling.classList.remove('active');
                    sibling.querySelector('.faq-question').classList.remove('active');
                    sibling.querySelector('.faq-answer').classList.remove('active');

                    // If we are closing a main item, we must also close any active children inside it
                    const nestedActiveChildren = sibling.querySelectorAll('.faq-item.active, .faq-item-main.active');
                    nestedActiveChildren.forEach(child => {
                        child.classList.remove('active');
                        child.querySelector('.faq-question').classList.remove('active');
                        child.querySelector('.faq-answer').classList.remove('active');
                    });
                }
            });

            // Toggle the clicked item's state
            if (!isActive) {
                parentItem.classList.add('active');
                this.classList.add('active');
                answer.classList.add('active');
            } else {
                parentItem.classList.remove('active');
                this.classList.remove('active');
                answer.classList.remove('active');
            }
        });
    });
});