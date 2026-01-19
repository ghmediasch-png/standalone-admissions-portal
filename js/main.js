document.addEventListener("DOMContentLoaded", function() {
    // --- Reusable Fetch Function ---
    const loadHTML = (filePath, placeholderId) => {
        return fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error(`Could not load ${filePath}. Status: ${response.status}`);
                return response.text();
            })
            .then(data => {
                if (document.getElementById(placeholderId)) {
                    document.getElementById(placeholderId).innerHTML = data;
                }
            })
            .catch(error => console.error(error));
    };

    // --- Load Header and then Initialize its Scripts ---
    loadHTML('partials/header.html', 'header-placeholder').then(() => {
        initializeHeaderScripts();
    });

    // --- Load Footer ---
    loadHTML('partials/footer.html', 'footer-placeholder');

    // --- Load Modal and then Initialize Apply Button Logic ---
    loadHTML('partials/apply-modal.html', 'modal-placeholder').then(() => {
        initializeApplyButton();
    });

    // --- Scripts to run AFTER the header is loaded ---
    function initializeHeaderScripts() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        const currentPage = document.body.getAttribute('data-page');
        const navLinks = navMenu.getElementsByTagName('a');
        
        for (let link of navLinks) {
            const linkPage = link.getAttribute('href').split('.')[0].split('#')[0];
            if (currentPage && linkPage.includes(currentPage)) {
                link.classList.add('active-link');
                break;
            }
        }
    }

    // --- Scripts to run AFTER the modal is loaded ---
    function initializeApplyButton() {
        const applyButtons = document.querySelectorAll('.btn-cta');
        const modal = document.getElementById('apply-modal');
        const closeModalBtn = document.getElementById('modal-close-btn');
        const continueBtn = document.getElementById('modal-continue-btn');

        if (!applyButtons.length) return; // Exit if no apply buttons on page

        // Set the link for the continue button inside the modal
        if (continueBtn) {
            continueBtn.href = AppConfig.applicationUrl;
        }

        applyButtons.forEach(button => {
            if (AppConfig.applyNowMode === 'direct') {
                // Mode 1: Direct link
                button.href = AppConfig.applicationUrl;
                button.target = ""; // Open in new tab
                button.rel = "noopener noreferrer";
            } else {
                // Mode 2: Show modal
                button.href = "#"; // Prevent navigation
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (modal) modal.style.display = 'flex';
                });
            }
        });

        // Event listener to close the modal
        if (modal && closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // Also close if user clicks on the overlay
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }
});