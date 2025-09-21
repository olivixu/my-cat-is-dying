// Scene 11: "I wonder how I will live without her" - Photo Scrapbook
import { Scene } from '../sceneManager.js';

export class Scene11 extends Scene {
    constructor(container) {
        super(container);
        this.text = "I wonder how I will live without her.";
        
        // Scrapbook state
        this.pages = [];
        this.cover = null;
        this.coverFlipped = false;
        this.currentPage = 0;
        this.autoFlipping = false;
        this.baseFlipSpeed = 2000;
        this.currentFlipSpeed = 2000;
        this.minSpeed = 150;
        this.maxSpeed = 3500;
        this.blackOverlay = null; // Track overlay for cleanup
        
        // Page data - dates for each page face (chronologically ordered)
        this.pageData = [
            // 2020 - Early memories
            {
                front: { date: "December 11, 2020", photo: "assets/images/Photo-album/Png/Dec 11 2020.png" },
                back: { date: "December 15, 2020", photo: "assets/images/Photo-album/Png/Dec 15 2020.png" }
            },
            // 2021 - Happy times
            {
                front: { date: "January 4, 2021", photo: "assets/images/Photo-album/Png/Jan 4 2021.png" },
                back: { date: "January 15, 2021", photo: "assets/images/Photo-album/Png/Jan 15 2021.png" }
            },
            {
                front: { date: "March 16, 2021", photo: "assets/images/Photo-album/Png/Mar 16 2021.png" },
                back: { date: "April 6, 2021", photo: "assets/images/Photo-album/Png/Apr 6 2021.png" }
            },
            {
                front: { date: "August 1, 2021", photo: "assets/images/Photo-album/Png/Aug 1 2021.png" },
                back: { date: "August 28, 2021", photo: "assets/images/Photo-album/Png/Aug 28 2021.png" }
            },
            {
                front: { date: "August 31, 2021", photo: "assets/images/Photo-album/Png/Aug 31 2021.png" },
                back: { date: "October 15, 2021", photo: "assets/images/Photo-album/Png/Oct 15 2021.png" }
            },
            {
                front: { date: "October 31, 2021", photo: "assets/images/Photo-album/Png/Oct 31 2021.png" },
                back: { date: "November 14, 2021", photo: "assets/images/Photo-album/Png/Nov 14 2021.png" }
            },
            {
                front: { date: "December 28, 2021", photo: "assets/images/Photo-album/Png/Dec 28 2021.png" },
                back: { date: "July 29, 2022", photo: "assets/images/Photo-album/Png/July 29 2022.png" }
            },
            // 2022 - Still together
            {
                front: { date: "September 14, 2022", photo: "assets/images/Photo-album/Png/Sep 14 2022.png" },
                back: { date: "October 13, 2022", photo: "assets/images/Photo-album/Png/Oct 13 2022.png" }
            },
            // 2023 - Beginning to fade
            {
                front: { date: "April 23, 2023", photo: "assets/images/Photo-album/Png/Apr 23 2023.png", darkness: 0.1 },
                back: { date: "July 3, 2023", photo: "assets/images/Photo-album/Png/Jul 3 2023.png", darkness: 0.15 }
            },
            {
                front: { date: "September 5, 2023", photo: "assets/images/Photo-album/Png/Sep 5 2023.png", darkness: 0.2 },
                back: { date: "January 3, 2024", photo: "assets/images/Photo-album/Png/Jan 3 2024.png", darkness: 0.3 }
            },
            // 2024-2025 - Fading memories
            {
                front: { date: "September 7, 2024", photo: "assets/images/Photo-album/Png/Sep 7 2024.png", darkness: 0.4 },
                back: { date: "February 13, 2025", photo: "assets/images/Photo-album/Png/Feb 13 2025.png", darkness: 0.5 }
            },
            {
                front: { date: "February 14, 2025", photo: "assets/images/Photo-album/Png/Feb 14 2025.png", darkness: 0.55 },
                back: { date: "February 27, 2025", photo: "assets/images/Photo-album/Png/Feb 27 2025.png", darkness: 0.6 }
            },
            {
                front: { date: "April 19, 2025", photo: "assets/images/Photo-album/Png/Apr 19 2025.png", darkness: 0.7 },
                back: { date: "April 23, 2025", photo: "assets/images/Photo-album/Png/Apr 23 2025.png", darkness: 0.75 }
            },
            {
                front: { date: "April 27, 2025", photo: "assets/images/Photo-album/Png/Apr 27 2025.png", darkness: 0.8 },
                back: { date: "May 4, 2025", photo: "assets/images/Photo-album/Png/May 4 2025.png", darkness: 0.85 }
            },
            {
                front: { date: "July 28, 2025", photo: "assets/images/Photo-album/Png/July 28 2025.png", darkness: 0.9 },
                back: { date: "August 31, 2025", photo: "assets/images/Photo-album/Png/Aug 31 2025.png", darkness: 1.0 }
            },
            // Mystery pages - completely black pages
            {
                front: { date: "", photo: "", darkness: 1.0, isBlank: true },
                back: { date: "", photo: "", darkness: 1.0, isBlank: true }
            },
            {
                front: { date: "", photo: "", darkness: 1.0, isBlank: true },
                back: { date: "", photo: "", darkness: 1.0, isBlank: true }
            },
            {
                front: { date: "", photo: "", darkness: 1.0, isBlank: true },
                back: { date: "", photo: "", darkness: 1.0, isBlank: true }
            },
            {
                front: { date: "", photo: "", darkness: 1.0, isBlank: true },
                back: { date: "", photo: "", darkness: 1.0, isBlank: true }
            },
            {
                front: { date: "", photo: "", darkness: 1.0, isBlank: true },
                back: { date: "", photo: "", darkness: 1.0, isBlank: true }
            },
            {
                front: { date: "", photo: "", darkness: 1.0, isBlank: true },
                back: { date: "", photo: "", darkness: 1.0, isBlank: true, isLast: true }
            }
        ];
    }
    
    async init() {
        // Preload cover image
        const coverImage = new Image();
        coverImage.src = 'assets/images/Photo-album/Cover.png';
        await new Promise(resolve => {
            if (coverImage.complete) {
                resolve();
            } else {
                coverImage.onload = resolve;
                coverImage.onerror = resolve; // Continue even if cover fails to load
            }
        });
        
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-11 scrapbook-scene';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text scrapbook-title';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create book container
        const bookContainer = document.createElement('div');
        bookContainer.className = 'book-container';
        
        // Create book - start hidden
        const book = document.createElement('div');
        book.className = 'book';
        book.id = 'scrapbook';
        book.style.opacity = '0';
        book.style.transition = 'opacity 0.5s ease-out';
        
        // Create cover
        const cover = document.createElement('div');
        cover.className = 'book-cover';
        cover.id = 'book-cover';
        
        const coverFront = document.createElement('div');
        coverFront.className = 'cover-content front';
        
        const coverBack = document.createElement('div');
        coverBack.className = 'cover-content back';
        
        cover.appendChild(coverFront);
        cover.appendChild(coverBack);
        book.appendChild(cover);
        
        // Create pages
        this.pageData.forEach((data, index) => {
            const page = document.createElement('div');
            page.className = 'book-page';
            page.id = `page-${index}`;
            page.style.zIndex = 5 - index; // Stack pages properly
            
            // Front of page
            const pageFront = document.createElement('div');
            pageFront.className = 'page-content front';
            
            if (data.front.isBlank) {
                // Completely black page
                pageFront.innerHTML = `
                    ${data.front.date ? `<h2 style="color: #333;">${data.front.date}</h2>` : ''}
                    <div class="photo-frame" style="background: #000; box-shadow: none;">
                        <div class="photo-darkness-overlay" style="opacity: 1"></div>
                    </div>
                `;
            } else if (data.front.darkness) {
                pageFront.innerHTML = `
                    <h2>${data.front.date}</h2>
                    <div class="photo-frame">
                        <img src="${data.front.photo}" alt="${data.front.date}" class="photo-placeholder" style="opacity: ${1 - data.front.darkness}">
                        <div class="photo-darkness-overlay" style="opacity: ${data.front.darkness}"></div>
                    </div>
                `;
            } else {
                pageFront.innerHTML = `
                    <h2>${data.front.date}</h2>
                    <div class="photo-frame">
                        <img src="${data.front.photo}" alt="${data.front.date}" class="photo-placeholder">
                    </div>
                `;
            }
            
            // Back of page
            const pageBack = document.createElement('div');
            pageBack.className = 'page-content back';
            
            if (data.back.isBlank) {
                // Completely black page
                pageBack.innerHTML = `
                    ${data.back.date ? `<h2 style="color: #333;">${data.back.date}</h2>` : ''}
                    <div class="photo-frame" style="background: #000; box-shadow: none;">
                        <div class="photo-darkness-overlay" style="opacity: 1"></div>
                    </div>
                `;
            } else if (data.back.darkness) {
                pageBack.innerHTML = `
                    <h2>${data.back.date}</h2>
                    <div class="photo-frame">
                        <img src="${data.back.photo}" alt="${data.back.date}" class="photo-placeholder" style="opacity: ${1 - data.back.darkness}">
                        <div class="photo-darkness-overlay" style="opacity: ${data.back.darkness}"></div>
                    </div>
                `;
            } else {
                pageBack.innerHTML = `
                    <h2>${data.back.date}</h2>
                    <div class="photo-frame">
                        <img src="${data.back.photo}" alt="${data.back.date}" class="photo-placeholder">
                    </div>
                `;
            }
            
            page.appendChild(pageFront);
            page.appendChild(pageBack);
            book.appendChild(page);
            
            this.pages.push(page);
        });
        
        // Add binding shadow
        const bindingShadow = document.createElement('div');
        bindingShadow.className = 'binding-shadow';
        book.appendChild(bindingShadow);
        
        // Assemble
        bookContainer.appendChild(book);
        this.element.appendChild(textContainer);
        this.element.appendChild(bookContainer);
        this.container.appendChild(this.element);
        
        // Store reference
        this.book = book;
        this.bookContainer = bookContainer;
        this.bindingShadow = bindingShadow;
        this.cover = cover;
        this.pages = Array.from(book.querySelectorAll('.book-page'));
        
        // Fade in book after a brief delay
        setTimeout(() => {
            book.style.opacity = '1';
        }, 100);
        
        // Single click handler on the book
        book.addEventListener('click', () => {
            if (!this.autoFlipping && !this.coverFlipped) {
                this.startAutoFlip();
            }
        });
    }
    
    startAutoFlip() {
        this.autoFlipping = true;
        this.autoFlip();
    }
    
    calculateFlipSpeed(currentPage, totalPages) {
        const pagesRemaining = totalPages - currentPage;
        const progress = currentPage / totalPages;
        
        // Keep fast speed even for the last page
        if (pagesRemaining === 1) {
            // Keep it fast, just slightly less than the second-to-last
            return this.minSpeed * 2; // 300ms
        } else {
            // Continuously accelerate until the end
            // Use exponential acceleration for dramatic speed increase
            const t = Math.min(progress * 1.2, 1); // Cap at 1 to avoid going too fast
            const speedFactor = Math.pow(1 - t, 2) * 0.9 + 0.1; // Exponential from 1.0 to 0.1
            return Math.max(this.minSpeed, this.baseFlipSpeed * speedFactor);
        }
    }
    
    autoFlip() {
        // Flip cover first if not already flipped
        if (!this.coverFlipped) {
            this.flipCover();
            setTimeout(() => {
                this.currentFlipSpeed = this.calculateFlipSpeed(0, this.pages.length);
                this.autoFlip();
            }, this.currentFlipSpeed);
            return;
        }
        
        if (this.currentPage >= this.pages.length) {
            // Don't call onScrapbookComplete here - it will be called from triggerBlackExpansion
            return;
        }
        
        this.flipPage();
        
        // Calculate next flip speed
        this.currentFlipSpeed = this.calculateFlipSpeed(this.currentPage, this.pages.length);
        
        // Schedule next flip
        setTimeout(() => {
            this.autoFlip();
        }, this.currentFlipSpeed);
    }
    
    flipCover() {
        // Shift the book container to the right as cover opens
        this.bookContainer.classList.add('shifted');
        
        // Show the binding shadow as the book opens
        setTimeout(() => {
            this.bindingShadow.classList.add('visible');
        }, 300);
        
        this.cover.style.zIndex = 1000;
        this.cover.style.transition = `transform ${Math.min(2500, this.currentFlipSpeed * 0.8)}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
        this.cover.classList.add('flipped');
        
        // Reset z-index after flip completes
        setTimeout(() => {
            this.cover.style.zIndex = 0;
        }, Math.min(2500, this.currentFlipSpeed * 0.8));
        
        this.coverFlipped = true;
    }
    
    flipPage() {
        if (this.currentPage >= this.pages.length) return;
        
        const page = this.pages[this.currentPage];
        const pageData = this.pageData[this.currentPage];
        const originalZIndex = 5 - this.currentPage;
        
        // Check if this is the last black photo page
        if (pageData && pageData.back && pageData.back.isLast) {
            // Shift book further to the right for the last page (to center the right page)
            this.bookContainer.style.transform = 'translateX(500px)';
            
            // Trigger black expansion after this page flips
            setTimeout(() => {
                this.triggerBlackExpansion();
            }, Math.min(2500, this.currentFlipSpeed * 0.8) + 1500);
        }
        
        // Bring page to front during flip
        page.style.zIndex = 1000;
        page.style.transition = `transform ${Math.min(2500, this.currentFlipSpeed * 0.8)}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
        page.classList.add('flipped');
        
        // Reset z-index after flip completes - keep flipped pages behind unflipped ones
        setTimeout(() => {
            page.style.zIndex = 0;
        }, Math.min(2500, this.currentFlipSpeed * 0.8));
        
        this.currentPage++;
    }
    
    triggerBlackExpansion() {
        // Find the last visible photo frame on the right page
        const visiblePages = this.element.querySelectorAll('.book-page:not(.flipped)');
        let photoFrame = null;
        let photoPlaceholder = null;
        
        if (visiblePages.length > 0) {
            const lastVisiblePage = visiblePages[visiblePages.length - 1];
            photoFrame = lastVisiblePage.querySelector('.photo-frame');
            photoPlaceholder = lastVisiblePage.querySelector('.photo-placeholder');
        }
        
        // If no visible pages, look for the last photo in general
        if (!photoFrame) {
            const allFrames = this.element.querySelectorAll('.photo-frame');
            if (allFrames.length > 0) {
                photoFrame = allFrames[allFrames.length - 1];
                photoPlaceholder = photoFrame.querySelector('.photo-placeholder');
            }
        }
        
        // Create black overlay that expands from the last photo
        const blackOverlay = document.createElement('div');
        blackOverlay.className = 'black-expansion-overlay';
        this.blackOverlay = blackOverlay; // Store reference for cleanup
        
        // Position it at the photo placeholder location and match rotation
        if (photoPlaceholder && photoFrame) {
            const rect = photoPlaceholder.getBoundingClientRect();
            
            // Get the rotation of the photo frame
            const frameStyle = window.getComputedStyle(photoFrame);
            const transform = frameStyle.transform;
            let rotation = 0;
            
            // Extract rotation from transform matrix if present
            if (transform && transform !== 'none') {
                // For simple 2D rotation, we can extract from the transform
                // Check if it's a simple rotate transform
                const rotateMatch = frameStyle.transform.match(/rotate\(([^)]+)\)/);
                if (rotateMatch) {
                    rotation = rotateMatch[1];
                } else {
                    // Try to extract from matrix
                    const values = transform.match(/matrix\(([^)]+)\)/);
                    if (values) {
                        const parts = values[1].split(',');
                        const a = parseFloat(parts[0]);
                        const b = parseFloat(parts[1]);
                        rotation = Math.atan2(b, a) * (180 / Math.PI) + 'deg';
                    }
                }
            }
            
            // Position at exact photo location - start smaller
            const scaleFactor = 0.6; // Start at 60% of photo size
            blackOverlay.style.width = (rect.width * scaleFactor) + 'px';
            blackOverlay.style.height = (rect.height * scaleFactor) + 'px';
            blackOverlay.style.left = (rect.left + rect.width * (1 - scaleFactor) / 2) + 'px';
            blackOverlay.style.top = (rect.top + rect.height * (1 - scaleFactor) / 2) + 'px';
            blackOverlay.style.transform = `rotate(${rotation})`;
            blackOverlay.style.position = 'fixed';
            blackOverlay.style.transformOrigin = 'center center';
            // Store initial rotation for expansion
            blackOverlay.style.setProperty('--initial-rotation', rotation);
        } else {
            // Fallback to center (slightly lower to match photo position)
            blackOverlay.style.width = '100px';
            blackOverlay.style.height = '100px';
            blackOverlay.style.left = '50%';
            blackOverlay.style.top = '58%';
            blackOverlay.style.transform = 'translate(-50%, -50%)';
            blackOverlay.style.position = 'fixed';
        }
        
        // Append to body for full expansion
        document.body.appendChild(blackOverlay);
        
        // Force reflow
        blackOverlay.offsetHeight;
        
        // Start expansion with a slight delay
        setTimeout(() => {
            blackOverlay.classList.add('expand');
        }, 100);
        
        // After expansion completes, trigger scene transition
        setTimeout(() => {
            this.onScrapbookComplete();
        }, 3000); // Allow full 3s animation
    }
    
    
    onScrapbookComplete() {
        // Trigger transition to next scene
        document.dispatchEvent(new CustomEvent('scrapbookComplete'));
        
        // Also trigger scene manager
        setTimeout(() => {
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        }, 500);
    }
    
    cleanup() {
        // Remove black overlay if it exists
        if (this.blackOverlay && this.blackOverlay.parentNode) {
            this.blackOverlay.parentNode.removeChild(this.blackOverlay);
            this.blackOverlay = null;
        }
        // Remove any pending timeouts if needed
        super.cleanup();
    }
}