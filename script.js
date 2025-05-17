document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        once: true,
        offset: 50,
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1 && href.startsWith('#') && document.querySelector(href)) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                const navbarHeight = document.querySelector('.navbar.sticky-top')?.offsetHeight || 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Dynamic Copyright Year
    const yearSpans = document.querySelectorAll('#currentYear, #currentYearAbout, #currentYearDeadlines, #currentYearHome, #currentYearPrograms, #currentYearAppForm, #currentYearLogin, #currentYearRegister, #currentYearContactUs');
    yearSpans.forEach(span => {
        if (span) span.textContent = new Date().getFullYear();
    });

    // Active Navigation Link Highlighting
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const sections = document.querySelectorAll('section[id], header.hero-page-header[id], section.contact-hero[id]'); 

    function changeNavActiveState() {
        let currentSectionId = null; 
        const navbarHeight = document.querySelector('.navbar.sticky-top')?.offsetHeight || 70;
        const scrollPosition = window.pageYOffset + navbarHeight + 100; // Increased offset for better detection

        sections.forEach(section => {
            if (section.offsetTop <= scrollPosition && (section.offsetTop + section.offsetHeight) > scrollPosition) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        const currentPage = window.location.pathname.split("/").pop() || 'home.html';

        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            const linkPageName = linkHref.split("#")[0];

            if (currentSectionId && linkHref === `#${currentSectionId}`) {
                link.classList.add('active');
            } else if (linkPageName === currentPage) {
                 // If currentSectionId is null (e.g. top of page) or section not matched,
                 // check if the link's page matches the current page.
                 // Prioritize section match if available.
                 if (!currentSectionId || (currentSectionId && linkHref !== `#${currentSectionId}`)) {
                    // Only add active if no section-specific link is already active on this page
                    let sectionLinkActive = false;
                    navLinks.forEach(l => {
                        if(l.classList.contains('active') && l.getAttribute('href').startsWith('#')) sectionLinkActive = true;
                    });
                    if(!sectionLinkActive) link.classList.add('active');
                 }
            }
        });
         // Final check to ensure at least one link matching the page is active if no section is
        let pageLinkIsActive = false;
        navLinks.forEach(link => {
            if(link.classList.contains('active')) pageLinkIsActive = true;
        });
        if(!pageLinkIsActive){
            navLinks.forEach(link => {
                 if (link.getAttribute('href') === currentPage) {
                    navLinks.forEach(l => l.classList.remove('active')); 
                    link.classList.add('active');
                }
            });
        }
    }


    if (navLinks.length > 0) { // Simplified condition
        window.addEventListener('scroll', changeNavActiveState);
        changeNavActiveState(); // Initial check
    }


    // Bootstrap Carousel Initialization
    const heroCarouselElement = document.getElementById('hero-carousel');
    if (heroCarouselElement) {
        new bootstrap.Carousel(heroCarouselElement, { interval: 5000, ride: 'carousel' });
    }
    const testimonialCarouselElement = document.getElementById('testimonialCarousel');
    if (testimonialCarouselElement) {
        new bootstrap.Carousel(testimonialCarouselElement, { interval: 6000, ride: 'carousel' });
    }

    // Animated Stats Counter
    const counters = document.querySelectorAll('.stats-counter-section .counter');
    const speed = 200; 

    const animateCounter = (counter) => {
        const target = +counter.dataset.target;
        const animate = () => {
            const value = +counter.innerText;
            const increment = Math.max(1, target / speed); // Ensure increment is at least 1
            if (value < target) {
                counter.innerText = Math.min(target, Math.ceil(value + increment));
                setTimeout(animate, 15);
            } else {
                counter.innerText = target.toLocaleString(); 
            }
        };
        animate();
    };

    const counterObserverOptions = { root: null, threshold: 0.3 }; // Trigger a bit earlier
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                animateCounter(entry.target);
                entry.target.dataset.animated = "true"; 
            }
        });
    }, counterObserverOptions);

    counters.forEach(counter => {
        counter.innerText = '0'; // Initialize to 0
        counterObserver.observe(counter);
    });


    // Program Page Filter
    if (document.getElementById('program-listing')) {
        const filterButtons = document.querySelectorAll('#program-listing .program-filter-buttons .btn');
        const programCards = document.querySelectorAll('#program-listing .program-card');
        const facultyFilterButtons = document.querySelectorAll('#faculties-overview .filter-btn');

        function filterProgramCards(filterType, filterValue) {
            programCards.forEach(card => {
                const matchesCategory = (filterValue === 'all' || card.dataset.category === filterValue);
                const matchesFaculty = (filterValue === 'all' || card.dataset.faculty === filterValue);
                
                let displayCard = false;
                if (filterType === 'level') { // Filtering by level (undergrad, grad, etc.)
                    displayCard = matchesCategory;
                } else if (filterType === 'faculty') { // Filtering by faculty (science, arts etc.)
                    displayCard = matchesFaculty;
                }


                if (displayCard) {
                    card.style.display = '';
                    // card.classList.remove('d-none'); // Using d-none might be better with AOS
                    // card.setAttribute('data-aos', 'zoom-in-up'); // Re-apply if needed
                } else {
                    card.style.display = 'none';
                    // card.classList.add('d-none');
                }
            });
            AOS.refreshHard(); // Refresh AOS for newly shown/hidden items
        }
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                facultyFilterButtons.forEach(btn => btn.classList.remove('active'));// Deactivate faculty filters
                this.classList.add('active');
                const filterValue = this.dataset.filter;
                filterProgramCards('level', filterValue);
            });
        });

        facultyFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                facultyFilterButtons.forEach(btn => btn.classList.remove('active'));
                filterButtons.forEach(btn => btn.classList.remove('active')); // Deactivate level filters
                filterButtons.forEach(btn => { if(btn.dataset.filter === 'all') btn.classList.add('active') }); // Reactivate "All Programs" level filter

                this.classList.add('active');
                const filterValue = this.dataset.filter;
                filterProgramCards('faculty', filterValue);

                // Scroll to program listing section
                const programListingSection = document.getElementById('program-listing');
                if(programListingSection) {
                     const navbarHeight = document.querySelector('.navbar.sticky-top')?.offsetHeight || 0;
                     const elementPosition = programListingSection.getBoundingClientRect().top;
                     const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
                     window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            });
        });
    }

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    });


    // Animated Background Bubbles (for auth and form pages)
    const bubbleContainer = document.querySelector('.background-bubbles');
    if (bubbleContainer) {
        const createBubble = () => {
            if(document.querySelectorAll('.background-bubbles .bubble').length > 25) return; // Limit bubbles

            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            const size = Math.random() * 60 + 20; 
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.random() * 100}%`;
            const duration = Math.random() * 10 + 15;
            bubble.style.animationDuration = `${duration}s`; 
            bubble.style.animationDelay = `${Math.random() * 5}s`;
            bubbleContainer.appendChild(bubble);

            setTimeout(() => {
                bubble.remove();
            }, duration * 1000 + 5000); // Remove after animation + delay + buffer
        };

        for (let i = 0; i < 10; i++) { 
            createBubble();
        }
        setInterval(createBubble, 3000); 
    }


    // Multi-step Application Form Logic
    const applicationForm = document.getElementById('admissionApplicationForm');
    if (applicationForm) {
        const formSections = applicationForm.querySelectorAll('.form-section');
        const nextStepButtons = applicationForm.querySelectorAll('.next-step');
        const prevStepButtons = applicationForm.querySelectorAll('.prev-step');
        const stepperItems = document.querySelectorAll('.form-stepper .step');
        let currentSectionIndex = 0;

        const updateStepper = () => {
            stepperItems.forEach((step, index) => {
                step.classList.remove('active', 'completed');
                if (index < currentSectionIndex) {
                    step.classList.add('completed');
                } else if (index === currentSectionIndex) {
                    step.classList.add('active');
                }
            });
        };

        const showSection = (index) => {
            formSections.forEach((section, i) => {
                section.classList.add('d-none');
                if (i === index) {
                    section.classList.remove('d-none');
                    section.setAttribute('data-aos', 'fade-up'); // Ensure AOS attribute
                    AOS.refreshHard(); 
                }
            });
            currentSectionIndex = index;
            updateStepper();
            const formCard = document.querySelector('.form-card');
            if(formCard) window.scrollTo(0, formCard.offsetTop - 100); 
        };

        nextStepButtons.forEach(button => {
            button.addEventListener('click', () => {
                const currentInputs = formSections[currentSectionIndex].querySelectorAll('input[required], textarea[required], select[required]');
                let isValid = true;
                currentInputs.forEach(input => {
                    if (!input.value.trim() && input.type !== 'file') { // File input validation is different
                        input.classList.add('is-invalid'); 
                        isValid = false;
                    } else {
                        input.classList.remove('is-invalid');
                    }
                     // Custom validation for file inputs if needed
                    if (input.type === 'file' && input.required && input.files.length === 0) {
                        // Handle file input validation message differently, e.g., next to the upload wrapper
                        isValid = false;
                    }
                });

                if (isValid) {
                    const nextSectionIndex = parseInt(button.dataset.next) - 1;
                    if (nextSectionIndex < formSections.length) {
                        showSection(nextSectionIndex);
                    }
                } else {
                    alert("براہ کرم موجودہ حصے میں تمام مطلوبہ خانے (*) پُر کریں۔");
                }
            });
        });

        prevStepButtons.forEach(button => {
            button.addEventListener('click', () => {
                const prevSectionIndex = parseInt(button.dataset.prev) - 1;
                if (prevSectionIndex >= 0) {
                    showSection(prevSectionIndex);
                }
            });
        });

        // Document Upload Preview for multiple file inputs
        function setupFileUpload(inputId, listId) {
            const docFileInput = document.getElementById(inputId);
            const fileListDiv = document.getElementById(listId);
            if (docFileInput && fileListDiv) {
                docFileInput.addEventListener('change', function() {
                    fileListDiv.innerHTML = ''; 
                    if (this.files.length > 0) {
                        for(let i = 0; i < this.files.length; i++) {
                            const fileName = this.files[i].name;
                            const fileSize = (this.files[i].size / 1024).toFixed(2) + ' KB';
                            const fileInfo = document.createElement('span');
                            fileInfo.className = 'badge bg-secondary me-1 mb-1';
                            fileInfo.textContent = `${fileName} (${fileSize})`;
                            fileListDiv.appendChild(fileInfo);
                        }
                    }
                });
            }
        }
        setupFileUpload('documentFileCnic', 'cnicFileList');
        setupFileUpload('documentFileMatric', 'matricFileList');
        // Add more calls to setupFileUpload for other file inputs if any


        applicationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const declaration = document.getElementById('declaration');
            if (!declaration.checked) {
                alert("براہ کرم جمع کروانے سے پہلے تصدیقی بیان سے اتفاق کریں۔");
                declaration.focus();
                return;
            }
            
            console.log("Application Submitted:");
            // const formData = new FormData(this);
            // for (let [key, value] of formData.entries()) {
            //     console.log(key, value);
            // }
            alert('آپ کی درخواست کامیابی سے جمع ہو گئی ہے! آپ کو جلد ہی ای میل کے ذریعے تصدیق موصول ہوگی۔');
            // window.location.href = 'dashboard.html'; // Example redirect
        });

        showSection(0); 
    }

    // Registration Form Logic
    const regForm = document.getElementById('registrationForm');
    if (regForm) {
        regForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const pass = document.getElementById('regPassword').value;
            const confirmPass = document.getElementById('regConfirmPassword').value;
            if (pass !== confirmPass) {
                alert("پاس ورڈ مماثل نہیں ہیں!");
                return;
            }
            if (!document.getElementById('agreeTerms').checked) {
                alert("براہ کرم رجسٹر کرنے کے لیے شرائط و ضوابط سے اتفاق کریں۔");
                return;
            }
            console.log("Registration attempt with:", this.regEmail.value);
            alert("رجسٹریشن کامیاب! براہ کرم اپنے اکاؤنٹ کی تصدیق کے لیے اپنا ای میل چیک کریں۔");
            // window.location.href = 'login.html';
        });
    }

    // Login Form Logic
    const loginFormEl = document.getElementById('loginForm');
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Login attempt with:", this.loginEmail.value);
            alert("لاگ ان کامیاب! ڈیش بورڈ پر منتقل کیا جا رہا ہے...");
            // window.location.href = 'dashboard.html'; // Example redirect
        });
    }

    // Contact Us Page - Animated Background Elements (Attractive Contact Us)
    const contactBgContainer = document.querySelector('.contact-us-page .contact-bg-elements'); // More specific selector
    if (contactBgContainer) {
        const createContactBgElement = () => {
             if(document.querySelectorAll('.contact-us-page .contact-bg-elements span').length > 10) return;

            const el = document.createElement('span');
            const size = Math.random() * 150 + 50; 
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            el.style.left = `${Math.random() * 100}%`;
            const duration = Math.random() * 15 + 20;
            el.style.animationDuration = `${duration}s`; 
            el.style.animationDelay = `${Math.random() * 5}s`;
            contactBgContainer.appendChild(el);

            setTimeout(() => {
                el.remove();
            }, duration * 1000 + 5000);
        };
        for (let i = 0; i < 5; i++) { 
            createContactBgElement();
        }
        setInterval(createContactBgElement, 4000);
    }

    // Contact Form Submission (Attractive Contact Us Page)
    const attractiveContactForm = document.getElementById('attractiveContactForm');
    if (attractiveContactForm) {
        attractiveContactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (!name || !email || !message) {
                alert('براہ کرم تمام ضروری خانے (*) پُر کریں۔');
                return;
            }
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert('براہ کرم درست ای میل ایڈریس درج کریں۔');
                return;
            }
            
            const submitButton = this.querySelector('.btn-submit-contact-form');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> بھیجا جا رہا ہے...';
            submitButton.disabled = true;

            setTimeout(() => { 
                alert('آپ کا پیغام کامیابی سے بھیج دیا گیا ہے! ہم جلد ہی آپ سے رابطہ کریں گے۔');
                attractiveContactForm.reset();
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }, 2000);
        });
    }
});