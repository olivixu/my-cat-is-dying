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
        this.flipSpeed = 2000;
        this.speedMultiplier = 0.75;
        this.minSpeed = 200;
        this.blackOverlay = null; // Track overlay for cleanup
        
        // Page data - dates for each page face
        this.pageData = [
            // Happy memories
            {
                front: { date: "January 15, 2020", photo: "Cat photo 1" },
                back: { date: "March 3, 2020", photo: "Cat photo 2" }
            },
            {
                front: { date: "June 21, 2020", photo: "Cat photo 3" },
                back: { date: "September 10, 2020", photo: "Cat photo 4" }
            },
            {
                front: { date: "December 25, 2020", photo: "Cat photo 5" },
                back: { date: "February 14, 2021", photo: "Cat photo 6" }
            },
            {
                front: { date: "May 1, 2021", photo: "Cat photo 7" },
                back: { date: "August 15, 2021", photo: "Cat photo 8" }
            },
            {
                front: { date: "November 11, 2021", photo: "Cat photo 9" },
                back: { date: "January 1, 2022", photo: "Cat photo 10" }
            },
            // More memories
            {
                front: { date: "March 15, 2022", photo: "Cat photo 11" },
                back: { date: "May 20, 2022", photo: "Cat photo 12" }
            },
            {
                front: { date: "July 4, 2022", photo: "Cat photo 13" },
                back: { date: "October 31, 2022", photo: "Cat photo 14" }
            },
            {
                front: { date: "December 24, 2022", photo: "Cat photo 15" },
                back: { date: "January 15, 2023", photo: "Cat photo 16" }
            },
            // Gradually fading memories
            {
                front: { date: "March 2023", photo: "Still here", darkness: 0.1 },
                back: { date: "April 2023", photo: "Fading slightly", darkness: 0.2 }
            },
            {
                front: { date: "May 2023", photo: "Getting hazier", darkness: 0.3 },
                back: { date: "June 2023", photo: "Harder to see", darkness: 0.4 }
            },
            {
                front: { date: "July 2023", photo: "Dimming", darkness: 0.5 },
                back: { date: "August 2023", photo: "Shadows growing", darkness: 0.6 }
            },
            {
                front: { date: "September 2023", photo: "Almost gone", darkness: 0.7 },
                back: { date: "October 2023", photo: "Barely there", darkness: 0.8 }
            },
            {
                front: { date: "", photo: "...", darkness: 0.85 },
                back: { date: "", photo: "...", darkness: 0.9 }
            },
            {
                front: { date: "", photo: "", darkness: 0.95 },
                back: { date: "", photo: "", darkness: 1.0, isLast: true }
            }
        ];
    }
    
    async init() {
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
        
        // Create book
        const book = document.createElement('div');
        book.className = 'book';
        book.id = 'scrapbook';
        
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
            
            if (data.front.darkness) {
                pageFront.innerHTML = `
                    <h2>${data.front.date}</h2>
                    <div class="photo-frame">
                        <div class="photo-placeholder" style="background: rgba(0, 0, 0, ${data.front.darkness}); color: rgba(160, 136, 114, ${1 - data.front.darkness})">${data.front.photo}</div>
                    </div>
                `;
            } else {
                pageFront.innerHTML = `
                    <h2>${data.front.date}</h2>
                    <div class="photo-frame">
                        <div class="photo-placeholder">${data.front.photo}</div>
                    </div>
                `;
            }
            
            // Back of page
            const pageBack = document.createElement('div');
            pageBack.className = 'page-content back';
            
            if (data.back.darkness) {
                pageBack.innerHTML = `
                    <h2>${data.back.date}</h2>
                    <div class="photo-frame">
                        <div class="photo-placeholder" style="background: rgba(0, 0, 0, ${data.back.darkness}); color: rgba(160, 136, 114, ${1 - data.back.darkness})">${data.back.photo}</div>
                    </div>
                `;
            } else {
                pageBack.innerHTML = `
                    <h2>${data.back.date}</h2>
                    <div class="photo-frame">
                        <div class="photo-placeholder">${data.back.photo}</div>
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
    
    autoFlip() {
        // Flip cover first if not already flipped
        if (!this.coverFlipped) {
            this.flipCover();
            setTimeout(() => {
                this.flipSpeed = Math.max(this.minSpeed, this.flipSpeed * this.speedMultiplier);
                this.autoFlip();
            }, this.flipSpeed);
            return;
        }
        
        if (this.currentPage >= this.pages.length) {
            // Don't call onScrapbookComplete here - it will be called from triggerBlackExpansion
            return;
        }
        
        this.flipPage();
        
        // Calculate pages remaining
        const pagesRemaining = this.pages.length - this.currentPage;
        const totalPages = this.pages.length;
        const progressPercent = this.currentPage / totalPages;
        
        // Schedule next flip - speed up first 60%, then slow down
        setTimeout(() => {
            if (progressPercent < 0.6) {
                // Speed up for first 60%
                this.flipSpeed = Math.max(this.minSpeed, this.flipSpeed * this.speedMultiplier);
            } else if (pagesRemaining === 1) {
                // Very slow for last page
                this.flipSpeed = 3000;
            } else if (pagesRemaining <= 3) {
                // Slow down for last few pages
                this.flipSpeed = Math.min(2000, this.flipSpeed * 1.3);
            } else {
                // Start slowing down after 60%
                this.flipSpeed = Math.min(2000, this.flipSpeed * 1.15);
            }
            this.autoFlip();
        }, this.flipSpeed);
    }
    
    flipCover() {
        // Shift the book container to the right as cover opens
        this.bookContainer.classList.add('shifted');
        
        // Show the binding shadow as the book opens
        setTimeout(() => {
            this.bindingShadow.classList.add('visible');
        }, 300);
        
        this.cover.style.zIndex = 1000;
        this.cover.style.transition = `transform ${Math.min(2500, this.flipSpeed * 0.8)}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
        this.cover.classList.add('flipped');
        
        // Reset z-index after flip completes
        setTimeout(() => {
            this.cover.style.zIndex = 0;
        }, Math.min(2500, this.flipSpeed * 0.8));
        
        this.coverFlipped = true;
    }
    
    flipPage() {
        if (this.currentPage >= this.pages.length) return;
        
        const page = this.pages[this.currentPage];
        const pageData = this.pageData[this.currentPage];
        const originalZIndex = 5 - this.currentPage;
        
        // Check if this is the last black photo page
        if (pageData && pageData.back && pageData.back.isLast) {
            // Trigger black expansion after this page flips
            setTimeout(() => {
                this.triggerBlackExpansion();
            }, Math.min(2500, this.flipSpeed * 0.8) + 500);
        }
        
        // Bring page to front during flip
        page.style.zIndex = 1000;
        page.style.transition = `transform ${Math.min(2500, this.flipSpeed * 0.8)}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
        page.classList.add('flipped');
        
        // Reset z-index after flip completes - keep flipped pages behind unflipped ones
        setTimeout(() => {
            page.style.zIndex = 0;
        }, Math.min(2500, this.flipSpeed * 0.8));
        
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
            // Fallback to center
            blackOverlay.style.width = '200px';
            blackOverlay.style.height = '200px';
            blackOverlay.style.left = '50%';
            blackOverlay.style.top = '50%';
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