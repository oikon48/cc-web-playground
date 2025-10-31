// ========================================
// Smooth Scroll for Navigation Links
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // Header Scroll Effect
    // ========================================
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add shadow on scroll
        if (currentScroll > 10) {
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // ========================================
    // Intersection Observer for Fade-in Animation
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards and sections
    const animateElements = document.querySelectorAll('.card, .finding, .env-card, .doc-card, .info-box');

    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // ========================================
    // Copy Code Block on Click
    // ========================================
    document.querySelectorAll('.code-block').forEach(block => {
        block.style.cursor = 'pointer';
        block.title = 'クリックしてコピー';

        block.addEventListener('click', async () => {
            const code = block.querySelector('code').textContent;

            try {
                await navigator.clipboard.writeText(code);

                // Show feedback
                const originalBorder = block.style.borderColor;
                block.style.borderColor = 'var(--success)';

                // Create and show copy message
                const message = document.createElement('div');
                message.textContent = 'コピーしました！';
                message.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: var(--success);
                    color: white;
                    padding: 12px 24px;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    box-shadow: var(--shadow-lg);
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                `;

                document.body.appendChild(message);

                setTimeout(() => {
                    message.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => {
                        document.body.removeChild(message);
                    }, 300);
                }, 2000);

                setTimeout(() => {
                    block.style.borderColor = originalBorder;
                }, 500);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });
    });

    // ========================================
    // Add CSS Animations
    // ========================================
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .code-block:hover {
            border-color: var(--primary) !important;
        }
    `;
    document.head.appendChild(style);

    // ========================================
    // Stats Counter Animation
    // ========================================
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = entry.target;
                target.classList.add('counted');

                const value = target.textContent.trim();
                const isNumber = /^\d+$/.test(value);

                if (isNumber) {
                    const finalValue = parseInt(value);
                    const duration = 1500;
                    const steps = 30;
                    const increment = finalValue / steps;
                    let current = 0;
                    const stepDuration = duration / steps;

                    const counter = setInterval(() => {
                        current += increment;
                        if (current >= finalValue) {
                            target.textContent = finalValue.toString();
                            clearInterval(counter);
                        } else {
                            target.textContent = Math.floor(current).toString();
                        }
                    }, stepDuration);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-value').forEach(stat => {
        statsObserver.observe(stat);
    });

    // ========================================
    // Mobile Menu Toggle (for future enhancement)
    // ========================================
    const mobileBreakpoint = 768;

    function handleResize() {
        const nav = document.querySelector('.nav');
        if (window.innerWidth <= mobileBreakpoint) {
            nav.style.flexDirection = 'column';
        } else {
            nav.style.flexDirection = 'row';
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    // ========================================
    // Console Message
    // ========================================
    console.log('%c🚀 Claude Code Sandbox', 'font-size: 24px; font-weight: bold; color: #FF6B35;');
    console.log('%cこのサイトについて調査・開発するのは大歓迎です！', 'font-size: 14px; color: #B0B0B0;');
    console.log('%cGitHub: https://github.com', 'font-size: 12px; color: #FF8C42;');
});
