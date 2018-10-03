// Activate Vue DevTools
Vue.config.devtools = true;

// Global event variable
const EventBus = new Vue();

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true,
        },
        inventory: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            brand: 'Vue Mastery',
            link: 'https://www.vuemastery.com',
            product: 'Socks',
            selectedVariant: 0,
            altText: 'A pair of socks',
            description: ' warm, fuzzy socks!',
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    id: 2234,
                    color: 'green',
                    image: './images/vmSocks-green.png',
                    quantity: 10,
                    onSale: true,
                },
                {
                    id: 2235,
                    color: 'blue',
                    image: './images/vmSocks-blue.png',
                    quantity: 5,
                    onSale: false,
                },
            ],
            sizes: ['Small', 'Medium', 'Large'],
            reviews: [],
        };
    },
    computed: {
        title() {
            return `${this.brand} ${this.product}`;
        },
        image() {
            return this.variants[this.selectedVariant].image;
        },
        inStock() {
            if (this.variants[this.selectedVariant].quantity === 0 || !this.inventory) {
                return false;
            }
            return true;
        },
        sale() {
            if (this.variants[this.selectedVariant].onSale) {
                return ' - On sale for limited time!';
            }
        },
        shipping() {
            if (this.premium) {
                return 'Free';
            }
            return '$2.99';
        },
    },
    mounted() {
        EventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
            console.log(this.reviews);
        });
    },
    methods: {
        addToCart() {
            this.$emit(
                'add-to-cart',
                this.variants[this.selectedVariant].id,
                this.variants[this.selectedVariant].quantity
            );
        },
        updateProduct(index) {
            this.selectedVariant = index;
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].id);
        },
    },
    template: `
        <article class="product">
            <figure class="product-image">
                <img v-bind:src="image" :alt="altText" />
            </figure>
            <section class="product-info">
                <h1>{{ title }} <span class="sales">{{ sale }}</span></h1>
                <p>
                    <a :href="link">{{ brand }}</a>
                    {{ description }}
                </p>
                <p v-if="inStock">In Stock</p>
                <p v-else>Out of Stock</p>
                <p>Shipping: {{ shipping }}</p>
                <product-details :details="details"></product-details>
                <p>Colors:</p>
                <div v-for="(variant, index) in variants" :key="variant.id" class="color-box" :style="{ backgroundColor: variant.color }"
                    v-on:mouseover="updateProduct(index)">
                    <p>{{ variant.color }}</p>
                </div>
                <p>Size:</p>
                <ul>
                    <li v-for="size in sizes">{{ size }}</li>
                </ul>
                <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add
                    to Cart</button>
                <button @click="removeFromCart">Remove from Cart</button>
            </section>
            <section class="review-tabs">
                <h2>What our Clients said!</h2>
                <review-tabs :reviews="reviews"></review-tabs>
            </section>
        </article>
    `,
});

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true,
        },
    },
    template: `
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>
    `,
});

Vue.component('product-review', {
    data() {
        return {
            name: null,
            review: null,
            recommend: null,
            rating: null,
            errors: [],
        };
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.recommend && this.rating) {
                const productReview = {
                    name: this.name,
                    review: this.review,
                    recommend: this.recommend,
                    rating: this.rating,
                };
                EventBus.$emit('review-submitted', productReview);
                this.name = null;
                this.review = null;
                this.recommend = null;
                this.rating = null;
                this.errors = [];
            } else {
                if (!this.name) this.errors.push('Name required.');
                if (!this.review) this.errors.push('Review required.');
                if (!this.recommend) this.errors.push('Recommendation required.');
                if (!this.rating) this.errors.push('Rating required.');
            }
        },
    },
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
        <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
                <li v-for="error in errors">{{ error }}</li>
            </ul>
        </p>
        <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name" placeholder="name">
        </p>
        <p>
            <label for="review">Review:</label>
            <textarea id="review" v-model="review"></textarea>
        </p>
        <p>
        <p>Would you recommend this product?</p>
            <label>Yes<input type="radio" value="Yes" v-model="recommend"/></label>
            <label>No<input type="radio" value="No" v-model="recommend"/></label>
        </p>
        <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
            </select>
        </p>
        <p>
            <input type="submit" value="Submit">
        </p>
    </form>
`,
});

Vue.component('review-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews',
        };
    },
    template: `
    <div>
        <span class="tab" :class="{activeTab: selectedTab === tab}" v-for="(tab, index) in tabs" :key="index" @click="selectedTab = tab">{{ tab }}</span>
        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul>
                <li v-for="review in reviews">
                    <p>Name: {{ review.name }}<span>Recommended: {{ review.recommend }}</span></p>
                    <p>Comment: {{ review.review }}</p>
                    <p>Rating: {{ review.rating }}</p>
                </li>
            </ul>
        </div>
        <product-review v-show="selectedTab === 'Make a Review'"></product-review>
    </div>
`,
});

const app = new Vue({
    el: '#app',
    data: {
        premium: true,
        inventory: true,
        cart: [],
    },
    methods: {
        increaseCart(id, quantity) {
            if (this.cart.length < quantity) {
                this.cart.push(id);
            } else {
                this.inventory = false;
            }
        },
        decreaseCart(id) {
            if (this.cart.length > 0) {
                for (let i = this.cart.length - 1; i >= 0; --i) {
                    if (this.cart[i] === id) {
                        this.cart.splice(i, 1);
                    }
                }
            }
            this.inventory = true;
        },
    },
});
