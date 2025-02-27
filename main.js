// مدیریت سبد خرید
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('amiriShopCart')) || [];
        this.cartButton = document.getElementById('cart-button');
        this.cartModal = document.getElementById('cart-modal');
        this.closeButton = document.querySelector('.close');
        this.cartItemsContainer = document.getElementById('cart-items');
        this.totalPriceElement = document.getElementById('total-price');
        this.cartCountElement = document.getElementById('cart-count');
        this.checkoutButton = document.getElementById('checkout-button');
        
        this.init();
    }
    
    init() {
        // نمایش تعداد محصولات در سبد خرید
        this.updateCartCount();
        
        // نمایش سبد خرید با کلیک روی آیکون
        this.cartButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.openCart();
        });
        
        // بستن سبد خرید با کلیک روی دکمه بستن
        this.closeButton.addEventListener('click', () => {
            this.closeCart();
        });
        
        // بستن سبد خرید با کلیک خارج از مودال
        window.addEventListener('click', (e) => {
            if (e.target === this.cartModal) {
                this.closeCart();
            }
        });
        
        // اضافه کردن محصولات به سبد خرید
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const product = button.closest('.product');
                const id = parseInt(product.dataset.id);
                const name = product.dataset.name;
                const price = parseInt(product.dataset.price);
                const image = product.querySelector('img').src;
                
                this.addToCart({
                    id,
                    name,
                    price,
                    image,
                    quantity: 1
                });
                
                // نمایش انیمیشن اضافه شدن به سبد خرید
                this.animateAddToCart(button);
            });
        });
        
        // تکمیل خرید
        this.checkoutButton.addEventListener('click', () => {
            if (this.cart.length === 0) {
                this.showNotification('سبد خرید شما خالی است!', 'error');
                return;
            }
            
            this.showNotification('در حال انتقال به صفحه پرداخت...', 'success');
            // در اینجا می‌توانید کاربر را به صفحه پرداخت هدایت کنید
            // window.location.href = 'checkout.html';
        });
    }
    
    // باز کردن مودال سبد خرید
    openCart() {
        this.renderCartItems();
        this.cartModal.style.display = 'block';
    }
    
    // بستن مودال سبد خرید
    closeCart() {
        this.cartModal.style.display = 'none';
    }
    
    // اضافه کردن محصول به سبد خرید
    addToCart(product) {
        // بررسی وجود محصول در سبد خرید
        const existingItemIndex = this.cart.findIndex(item => item.id === product.id);
        
        if (existingItemIndex !== -1) {
            // افزایش تعداد محصول موجود
            this.cart[existingItemIndex].quantity += 1;
            this.showNotification(`تعداد ${this.cart[existingItemIndex].name} افزایش یافت`, 'success');
        } else {
            // افزودن محصول جدید
            this.cart.push(product);
            this.showNotification(`${product.name} به سبد خرید اضافه شد`, 'success');
        }
        
        // ذخیره سبد خرید در localStorage
        localStorage.setItem('amiriShopCart', JSON.stringify(this.cart));
        
        // به‌روزرسانی تعداد محصولات و قیمت کل
        this.updateCartCount();
        this.calculateTotal();
    }
    
    // حذف محصول از سبد خرید
    removeFromCart(id) {
        const index = this.cart.findIndex(item => item.id === id);
        if (index !== -1) {
            const removedItem = this.cart[index];
            this.cart.splice(index, 1);
            
            // ذخیره سبد خرید در localStorage
            localStorage.setItem('amiriShopCart', JSON.stringify(this.cart));
            
            // به‌روزرسانی تعداد محصولات و قیمت کل
            this.updateCartCount();
            this.calculateTotal();
            this.renderCartItems();
            
            this.showNotification(`${removedItem.name} از سبد خرید حذف شد`, 'info');
        }
    }
    
    // تغییر تعداد محصول
    updateQuantity(id, change) {
        const index = this.cart.findIndex(item => item.id === id);
        if (index !== -1) {
            this.cart[index].quantity += change;
            
            // حذف محصول اگر تعداد به صفر رسید
            if (this.cart[index].quantity <= 0) {
                this.removeFromCart(id);
                return;
            }
            
            // ذخیره سبد خرید در localStorage
            localStorage.setItem('amiriShopCart', JSON.stringify(this.cart));
            
            // به‌روزرسانی تعداد محصولات و قیمت کل
            this.updateCartCount();
            this.calculateTotal();
            this.renderCartItems();
        }
    }
    
    // محاسبه قیمت کل
    calculateTotal() {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.totalPriceElement.textContent = this.formatPrice(total);
    }
    
    // به‌روزرسانی تعداد محصولات در سبد خرید
    updateCartCount() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCountElement.textContent = count;
        
        // نمایش یا عدم نمایش شمارنده
        if (count > 0) {
            this.cartCountElement.style.display = 'inline-block';
        } else {
            this.cartCountElement.style.display = 'none';
        }
    }
    
    // نمایش محصولات سبد خرید
    renderCartItems() {
        this.cartItemsContainer.innerHTML = '';
        
        if (this.cart.length === 0) {
            this.cartItemsContainer.innerHTML = '<p class="empty-cart">سبد خرید شما خالی است</p>';
            return;
        }
        
        this.cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="item-price">${this.formatPrice(item.price)} تومان</p>
                    <div class="quantity-control">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <p>${this.formatPrice(item.price * item.quantity)} تومان</p>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            this.cartItemsContainer.appendChild(cartItem);
        });
        
        // اضافه کردن دکمه خالی کردن سبد خرید
        const clearCartButton = document.createElement('button');
        clearCartButton.className = 'clear-cart';
        clearCartButton.textContent = 'خالی کردن سبد خرید';
        this.cartItemsContainer.appendChild(clearCartButton);
        
        // اضافه کردن رویدادها به دکمه‌ها
        this.addCartItemEventListeners();
        
        // محاسبه قیمت کل
        this.calculateTotal();
    }
    
    // اضافه کردن رویدادها به دکمه‌های سبد خرید
    addCartItemEventListeners() {
        // دکمه‌های کاهش تعداد
        document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.dataset.id);
                this.updateQuantity(id, -1);
            });
        });
        
        // دکمه‌های افزایش تعداد
        document.querySelectorAll('.quantity-btn.increase').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.dataset.id);
                this.updateQuantity(id, 1);
            });
        });
        
        // دکمه‌های حذف محصول
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.dataset.id);
                this.removeFromCart(id);
            });
        });
        
        // دکمه خالی کردن سبد خرید
        const clearCartButton = document.querySelector('.clear-cart');
        if (clearCartButton) {
            clearCartButton.addEventListener('click', () => {
                this.clearCart();
            });
        }
    }
    
    // خالی کردن سبد خرید
    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('آیا از خالی کردن سبد خرید اطمینان دارید؟')) {
            this.cart = [];
            localStorage.setItem('amiriShopCart', JSON.stringify(this.cart));
            this.updateCartCount();
            this.calculateTotal();
            this.renderCartItems();
            this.showNotification('سبد خرید خالی شد', 'info');
        }
    }
    
    // فرمت کردن قیمت
    formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    // نمایش اعلان
    showNotification(message, type = 'info') {
        // ایجاد المان اعلان
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // تعیین آیکون مناسب
        let icon;
        switch (type) {
            case 'success':
                icon = 'fa-check-circle';
                break;
            case 'error':
                icon = 'fa-exclamation-circle';
                break;
            default:
                icon = 'fa-info-circle';
        }
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icon}"></i>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // نمایش اعلان با انیمیشن
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // حذف اعلان بعد از مدتی
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // انیمیشن اضافه شدن به سبد خرید
    animateAddToCart(button) {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 300);
        
        // انیمیشن پرواز به سمت سبد خرید
        const product = button.closest('.product');
        const productImg = product.querySelector('img');
        const cartIcon = document.querySelector('.cart-icon');
        
        if (productImg && cartIcon) {
            // ایجاد یک کپی از تصویر محصول برای انیمیشن
            const flyingImg = document.createElement('img');
            flyingImg.src = productImg.src;
            flyingImg.style.position = 'fixed';
            flyingImg.style.width = '50px';
            flyingImg.style.height = '50px';
            flyingImg.style.objectFit = 'cover';
            flyingImg.style.borderRadius = '50%';
            flyingImg.style.zIndex = '1000';
            
            // محاسبه موقعیت شروع و پایان
            const start = productImg.getBoundingClientRect();
            const end = cartIcon.getBoundingClientRect();
            
            flyingImg.style.top = `${start.top}px`;
            flyingImg.style.left = `${start.left}px`;
            
            document.body.appendChild(flyingImg);
            
            // انیمیشن پرواز
            setTimeout(() => {
                flyingImg.style.transition = 'all 0.8s ease-in-out';
                flyingImg.style.top = `${end.top}px`;
                flyingImg.style.left = `${end.left}px`;
                flyingImg.style.opacity = '0.5';
                flyingImg.style.transform = 'scale(0.3)';
                
                setTimeout(() => {
                    document.body.removeChild(flyingImg);
                    
                    // انیمیشن آیکون سبد خرید
                    cartIcon.classList.add('bounce');
                    setTimeout(() => {
                        cartIcon.classList.remove('bounce');
                    }, 500);
                }, 800);
            }, 10);
        }
    }
}

// افکت‌های محصولات
class ProductEffects {
    constructor() {
        this.init();
    }
    
    init() {
        // افکت هاور روی محصولات
        const products = document.querySelectorAll('.product');
        products.forEach(product => {
            product.addEventListener('mouseenter', () => {
                product.classList.add('hover');
            });
            
            product.addEventListener('mouseleave', () => {
                product.classList.remove('hover');
            });
        });
        
        // بزرگنمایی تصاویر محصولات با کلیک
        const productImages = document.querySelectorAll('.product img');
        productImages.forEach(img => {
            img.addEventListener('click', () => {
                this.openImageModal(img.src, img.alt);
            });
        });
    }
    
    // نمایش تصویر بزرگ محصول
    openImageModal(src, alt) {
        // ایجاد مودال برای نمایش تصویر بزرگ
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <span class="close-image">&times;</span>
                <img src="${src}" alt="${alt}">
                <p>${alt}</p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // نمایش مودال با انیمیشن
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // بستن مودال با کلیک روی دکمه بستن
        const closeButton = modal.querySelector('.close-image');
        closeButton.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        // بستن مودال با کلیک خارج از تصویر
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            }
        });
    }
}

// بهبود رابط کاربری
class UIEnhancements {
    constructor() {
        this.init();
    }
    
    init() {
        this.addScrollToTopButton();
        this.addMobileMenu();
        this.addScrollAnimations();
    }
    
    // دکمه بازگشت به بالا
    addScrollToTopButton() {
        const scrollTopButton = document.createElement('button');
        scrollTopButton.className = 'scroll-top';
        scrollTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(scrollTopButton);
        
        // نمایش/مخفی کردن دکمه بر اساس اسکرول
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopButton.classList.add('show');
            } else {
                scrollTopButton.classList.remove('show');
            }
        });
        
        // اسکرول به بالا با کلیک روی دکمه
        scrollTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // منوی موبایل
    addMobileMenu() {
        const header = document.querySelector('header');
        
        // ایجاد دکمه منوی موبایل
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        header.appendChild(menuToggle);
        
        // باز/بسته کردن منو با کلیک روی دکمه
        menuToggle.addEventListener('click', () => {
            const nav = document.querySelector('nav');
            nav.classList.toggle('active');
            
            // تغییر آیکون
            const icon = menuToggle.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
        
        // بستن منو با کلیک خارج از آن
        document.addEventListener('click', (e) => {
            const nav = document.querySelector('nav');
            const menuToggle = document.querySelector('.mobile-menu-toggle');
            
            if (nav && nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                e.target !== menuToggle && 
                !menuToggle.contains(e.target)) {
                nav.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.className = 'fas fa-bars';
            }
        });
    }
    
    // انیمیشن‌های اسکرول
    addScrollAnimations() {
        const animateElements = document.querySelectorAll('.products-row, .main-title, .social-links, .address');
        
        // اضافه کردن کلاس برای انیمیشن
        animateElements.forEach(element => {
            element.classList.add('animate-on-scroll');
        });
        
        // تابع بررسی نمایش عناصر
        const checkVisibility = () => {
            animateElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementTop < windowHeight - 100) {
                    element.classList.add('visible');
                }
            });
        };
        
        // اجرای اولیه و اضافه کردن به رویداد اسکرول
        checkVisibility();
        window.addEventListener('scroll', checkVisibility);
    }
}

// اضافه کردن استایل‌های پویا
function addDynamicStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* استایل اعلان‌ها */
        .notification {
            position: fixed;
            top: 20px;
            left: 20px;
            padding: 15px;
            border-radius: 5px;
            background-color: #fff;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            transform: translateX(-120%);
            transition: transform 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
        }
        
        .notification i {
            margin-left: 10px;
            font-size: 20px;
        }
        
        .notification.success {
            border-right: 4px solid #4CAF50;
        }
        
        .notification.success i {
            color: #4CAF50;
        }
        
        .notification.error {
            border-right: 4px solid #F44336;
        }
        
        .notification.error i {
            color: #F44336;
        }
        
        .notification.info {
            border-right: 4px solid #2196F3;
        }
        
        .notification.info i {
            color: #2196F3;
        }
        
        /* استایل سبد خرید */
        .cart-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .cart-item-image {
            width: 60px;
            height: 60px;
            overflow: hidden;
            margin-left: 10px;
        }
        
        .cart-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .cart-item-details {
            flex: 1;
        }
        
        .cart-item-details h4 {
            margin: 0 0 5px;
        }
        
        .item-price {
            color: #666;
            margin: 0 0 5px;
        }
        
        .quantity-control {
            display: flex;
            align-items: center;
        }
        
        .quantity-btn {
            width: 25px;
            height: 25px;
            background-color: #f0f0f0;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .quantity {
            margin: 0 10px;
        }
        
        .cart-item-total {
            text-align: left;
            margin-right: 10px;
        }
        
        .remove-item {
            background: none;
            border: none;
            color:rgb(236, 37, 23);
            cursor: pointer;
            margin-top: 5px;
        }
        
        .empty-cart {
            text-align: center;
            padding: 20px;
            color: #666;
        }
        
        .clear-cart {
            display: block;
            width: 100%;
            padding: 10px;
            background-color: #f0f0f0;
            border: none;
            border-radius: 5px;
            margin-top: 10px;
            cursor: pointer;
        }
        
        /* استایل دکمه بازگشت به بالا */
        .scroll-top {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #2828b8;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 99;
        }
        
        .scroll-top.show {
            opacity: 1;
            visibility: visible;
        }
        
        .scroll-top:hover {
            background-color: #1a1a8a;
            transform: translateY(-3px);
        }
        
        /* استایل منوی موبایل */
        .mobile-menu-toggle {
            display: none;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #fff;
        }
        
        // @media (max-width: 768px) {
        //     .mobile-menu-toggle {
        //         display: block;
        //         position: absolute;
        //         top: 15px;
        //         left: 15px;
        //     }
            
        //     nav ul {
        //         position: fixed;
        //         top: 0;
        //         right: -100%;
        //         width: 70%;
        //         height: 100vh;
        //         background-color: #2828b8;
        //         flex-direction: column;
        //         padding-top: 60px;
        //         transition: right 0.3s ease;
        //         z-index: 100;
        //     }
            
        //     nav.active ul {
        //         right: 0;
        //     }
            
        //     nav ul li {
        //         margin: 10px 0;
        //     }
        // }
        
        /* استایل مودال تصویر */
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .image-modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .image-modal-content {
            position: relative;
            max-width: 80%;
            max-height: 80%;
        }
        
        .image-modal-content img {
            max-width: 100%;
            max-height: 70vh;
            display: block;
            margin: 0 auto;
        }
        
        .image-modal-content p {
            text-align: center;
            color: white;
            margin-top: 10px;
        }
        
        .close-image {
            position: absolute;
            top: -30px;
            right: 0;
            color: white;
            font-size: 30px;
            cursor: pointer;
        }
        
        /* انیمیشن‌های اسکرول */
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .animate-on-scroll.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* افکت دکمه افزودن به سبد خرید */
        .add-to-cart.clicked {
            animation: buttonPulse 0.3s ease;
        }
        
        @keyframes buttonPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        /* افکت هاور محصولات */
        .product.hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        /* انیمیشن آیکون سبد خرید */
        .cart-icon.bounce {
            animation: cartBounce 0.5s ease;
        }
        
        @keyframes cartBounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
    `;
    
    document.head.appendChild(styleElement);
}

// راه‌اندازی برنامه
document.addEventListener('DOMContentLoaded', () => {
    // اضافه کردن استایل‌های پویا
    addDynamicStyles();
    
    // ایجاد نمونه‌های کلاس‌ها
    const cart = new ShoppingCart();
    const productEffects = new ProductEffects();
    const uiEnhancements = new UIEnhancements();
});
