document.addEventListener('DOMContentLoaded', () => {
    
    // --- Navigation Bar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.style.background = 'rgba(10, 11, 16, 0.95)';
            navbar.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'transparent';
            navbar.style.borderBottom = 'none';
            navbar.style.backdropFilter = 'none';
        }
    });

    // --- Interactive Text Shine Effect (For About Section) ---
    // This script calculates the mouse position relative to each About card
    // and updates CSS variables so the glowing gradient follows your cursor.
    const aboutCards = document.querySelectorAll('.about-card');
    
    document.addEventListener('mousemove', (e) => {
        aboutCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse coordinates relative to the card
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Pass these coordinates to CSS variables on the container
            const textContainer = card.querySelector('.interactive-text-container');
            if(textContainer) {
                textContainer.style.setProperty('--mouse-x', `${x}px`);
                textContainer.style.setProperty('--mouse-y', `${y}px`);
            }
        });
    });

    // --- Legacy Form Feedback Handling (Commented Out per Request to retain original code) ---
    /*
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            
            const btn = this.querySelector('button[type="submit"]');
            const originalHtml = btn.innerHTML;
            
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            btn.style.opacity = '0.7';
            
            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: new FormData(this),
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    this.reset();
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Sent';
                    btn.style.backgroundColor = '#28a745';
                    btn.style.color = '#fff';
                    
                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                        btn.style.backgroundColor = '';
                        btn.style.opacity = '1';
                    }, 3000);
                } else {
                    alert("Oops! There was a problem submitting your form.");
                    btn.innerHTML = originalHtml;
                    btn.style.opacity = '1';
                }
            } catch (error) {
                alert("Network error. Please try again later.");
                btn.innerHTML = originalHtml;
                btn.style.opacity = '1';
            }
        });
    });
    */

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});