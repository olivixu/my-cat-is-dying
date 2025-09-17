// Scene 11: "I wonder how I will live without her" - Photo Scrapbook
import { Scene } from '../sceneManager.js';

export class Scene11 extends Scene {
    constructor(container) {
        super(container);
        this.text = "I wonder how I will live without her.";
        
        // Scrapbook state
        this.pages = [];
        this.currentPage = 0;
        this.autoFlipping = false;
        this.flipSpeed = 4000;
        this.speedMultiplier = 0.85;
        this.minSpeed = 500;
        
        // Page data - dates for each page face
        this.pageData = [
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
        
        // Create static left page (shows previous page back)
        const staticLeftPage = document.createElement('div');
        staticLeftPage.className = 'static-left-page';
        staticLeftPage.id = 'static-left';
        book.appendChild(staticLeftPage);
        
        // Create pages
        this.pageData.forEach((data, index) => {
            const page = document.createElement('div');
            page.className = 'book-page';
            page.id = `page-${index}`;
            page.style.zIndex = 5 - index; // Stack pages properly
            
            // Front of page
            const pageFront = document.createElement('div');
            pageFront.className = 'page-content front';
            pageFront.innerHTML = `
                <h2>${data.front.date}</h2>
                <div class="photo-frame">
                    <div class="photo-placeholder">${data.front.photo}</div>
                </div>
            `;
            
            // Back of page
            const pageBack = document.createElement('div');
            pageBack.className = 'page-content back';
            pageBack.innerHTML = `
                <h2>${data.back.date}</h2>
                <div class="photo-frame">
                    <div class="photo-placeholder">${data.back.photo}</div>
                </div>
            `;
            
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
        this.staticLeftPage = staticLeftPage;
        
        // Single click handler on the book
        book.addEventListener('click', () => {
            if (!this.autoFlipping && this.currentPage === 0) {
                this.startAutoFlip();
            }
        });
    }
    
    startAutoFlip() {
        this.autoFlipping = true;
        this.autoFlip();
    }
    
    autoFlip() {
        if (this.currentPage >= this.pages.length) {
            this.onScrapbookComplete();
            return;
        }
        
        this.flipPage();
        
        // Schedule next flip with acceleration
        setTimeout(() => {
            this.flipSpeed = Math.max(this.minSpeed, this.flipSpeed * this.speedMultiplier);
            this.autoFlip();
        }, this.flipSpeed);
    }
    
    flipPage() {
        if (this.currentPage >= this.pages.length) return;
        
        const page = this.pages[this.currentPage];
        const originalZIndex = 5 - this.currentPage;
        
        // Bring page to front during flip
        page.style.zIndex = 1000;
        page.style.transition = `transform ${Math.min(2500, this.flipSpeed * 0.8)}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
        page.classList.add('flipped');
        
        // Reset z-index after flip completes
        setTimeout(() => {
            page.style.zIndex = originalZIndex;
        }, Math.min(2500, this.flipSpeed * 0.8));
        
        // Update left page halfway through flip
        setTimeout(() => {
            this.updateLeftPage();
        }, Math.min(1250, this.flipSpeed * 0.4));
        
        this.currentPage++;
    }
    
    updateLeftPage() {
        if (this.currentPage <= 0) return;
        
        const prevPageIndex = this.currentPage - 1;
        const prevPageData = this.pageData[prevPageIndex];
        
        if (prevPageData && prevPageData.back) {
            this.staticLeftPage.innerHTML = `
                <h2>${prevPageData.back.date}</h2>
                <div class="photo-frame">
                    <div class="photo-placeholder">${prevPageData.back.photo}</div>
                </div>
            `;
            this.staticLeftPage.style.opacity = '1';
        }
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
        }, 1000);
    }
    
    cleanup() {
        // Remove any pending timeouts if needed
        super.cleanup();
    }
}