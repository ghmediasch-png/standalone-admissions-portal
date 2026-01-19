document.addEventListener("DOMContentLoaded", function() {
    // --- Hero Slider ---
    // Check if the slider exists on the page
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const totalSlides = slides.length;

        function showSlide(index) {
            if (slides.length > 0) {
                slides.forEach(slide => slide.classList.remove('active'));
                slides[index].classList.add('active');
            }
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }

        // Auto-advance slides every 5 seconds, only if there are slides
        if (totalSlides > 0) {
            showSlide(0); // Show the first slide initially
            setInterval(nextSlide, 5000);
        }
    }

    // --- FAQ Toggle ---
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', function() {
                toggleFAQ(this);
            });
        });
    }

    function toggleFAQ(element) {
        const answer = element.nextElementSibling;
        const questionIsActive = element.classList.contains('active');

        // Close all other open FAQs
        document.querySelectorAll('.faq-question.active').forEach(activeQuestion => {
            if (activeQuestion !== element) {
                activeQuestion.classList.remove('active');
                activeQuestion.nextElementSibling.classList.remove('active');
            }
        });

        // Toggle the clicked FAQ
        element.classList.toggle('active');
        answer.classList.toggle('active');
    }


    // --- Smooth Scroll for on-page anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Make sure it's an on-page link and not just '#'
            if (href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Close mobile menu if open after clicking a link
                    const hamburger = document.getElementById('hamburger');
                    const navMenu = document.getElementById('navMenu');
                    if (hamburger && navMenu && hamburger.classList.contains('active')) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                    }
                }
            }
        });
    });
});