import { createRouter, createElement, useState } from "./template_framework.js"

const cartState = useState([])

const checkoutState = useState({
  billingInfo: { name: "", address: "" },
  shippingInfo: { name: "", address: "" },
})

const addToCart = (product) => {
  cartState.value = [...cartState.value, product]
}

const Home = () => createElement(`<div><h1>Welcome to Our Shop!</h1></div>`)

const ProductList = () => {
  const products = getInitialProducts()
  return createElement(
    `<div><h1>Products</h1><ul>${products
      .map(
        (product) =>
          `<li><a href="/products/${product.id}">${product.name}</a></li>`
      )
      .join("")}</ul></div>`
  )
}

const ProductDetails = (product) => {
  if (!product) {
    return createElement(`<div><h1>Product Not Found</h1></div>`)
  }

  return createElement(
    `<div><h1>${product.name}</h1><p>${product.description}</p><button data-event="click" data-eventname="addToCart">Add to Cart</button></div>`,
    { addToCart: () => addToCart(product) }
  )
}

const Cart = () => {
  const cartItems = useState(cartState.value)
  return createElement(
    `<div><h1>Cart</h1><ul>${cartItems.value
      .map((item) => `<li>${item.name}</li>`)
      .join(
        ""
      )}</ul><button data-event="click" data-eventname="checkout">Checkout</button></div>`,
    { checkout: () => Router("/checkout") }
  )
}

const BillingInformation = () => {
  return createElement(
    `<div>
      <h1>Billing Information</h1>
      <form data-event="submit" data-eventname="next">
        <label>Name: <input type="text" value="${checkoutState.value.billingInfo.name}" name="name" /></label>
        <label>Address: <input type="text" value="${checkoutState.value.billingInfo.address}" name="address" /></label>
        <button type="submit">Next</button>
      </form>
    </div>`,
    {
      next: (event) => {
        event.preventDefault()
        const form = event.target
        checkoutState.value.billingInfo = {
          name: form.name.value,
          address: form.address.value,
        }
        Router("/checkout/shipping")
      },
    }
  )
}

const ShippingInformation = () => {
  return createElement(
    `<div>
      <h1>Shipping Information</h1>
      <form data-event="submit" data-eventname="next">
        <label>Name: <input type="text" name="name" value="${checkoutState.value.shippingInfo.name}" /></label>
        <label>Address: <input type="text" name="address" value="${checkoutState.value.shippingInfo.address}" /></label>
        <button type="submit">Next</button>
      </form>
    </div>`,
    {
      next: (event) => {
        const form = event.target
        checkoutState.value.shippingInfo = {
          name: form.name.value,
          address: form.address.value,
        }
        Router("/checkout/review")
      },
    }
  )
}

const ReviewOrder = () => {
  return createElement(
    `<div><h1>Review Order</h1>
      <h2>Billing Information:</h2>
      <p>Name: ${checkoutState.value.billingInfo.name}</p>
      <p>Address: ${checkoutState.value.billingInfo.address}</p>
      <h2>Shipping Information:</h2>
      <p>Name: ${checkoutState.value.shippingInfo.name}</p>
      <p>Address: ${checkoutState.value.shippingInfo.address}</p>
      <h2>Cart:</h2>
      <ul>${cartState.value
        .map((item) => `<li>${item.name}</li>`)
        .join("")}</ul>
      <button data-event="click" data-eventname="placeOrder">Place Order</button>
    </div>`,
    { placeOrder: () => Router("/confirmation") }
  )
}

const OrderConfirmation = () => {
  setTimeout(() => {
    cartState.value = []
    checkoutState.value = {
      billingInfo: { name: "", address: "" },
      shippingInfo: { name: "", address: "" },
    }
  }, 10000)

  return createElement(
    `<div>
      <h1>Order Confirmation</h1>
      <div class="confirmation">
        <h2>Thank you for your order!</h2>
        <p>Your order has been confirmed and will be processed shortly.</p>
        <div class="order-details">
          <h3>Order Summary:</h3>
          <ul>${cartState.value
            .map((item) => `<li>${item.name}</li>`)
            .join("")}</ul>
        </div>
        <div class="billing-details">
          <h3>Billing Information:</h3>
          <p>Name: ${checkoutState.value.billingInfo.name}</p>
          <p>Address: ${checkoutState.value.billingInfo.address}</p>
        </div>
        <div class="shipping-details">
          <h3>Shipping Information:</h3>
          <p>Name: ${checkoutState.value.shippingInfo.name}</p>
          <p>Address: ${checkoutState.value.shippingInfo.address}</p>
        </div>
      </div>
      <p class="note">Please keep this confirmation for your records.
      You have ten seconds to copy this information before it is deleted. 
      Good luck! LOL We hate you.</p>
    </div>`
  )
}

const NotFound = () => createElement(`<div><h1>Page Not Found</h1></div>`)

const Nav = () => {
  // // Nuclear Option: Refresh the page on every state change.
  // cartState.subscribe(() => Router.refresh())

  // // Better Option: Update the cart link text on every state change.
  // let cartItems = cartState.value.length
  // cartState.subscribe(() => {
  //   cartItems = cartState.value.length
  //   const cartLink = document.querySelector("a[href='/cart']")
  //   if (cartLink) {
  //     cartLink.textContent = `Cart (${cartItems})`
  //   }
  // })
  //   return createElement(
  //  `<div><a href="/">Home</a> <a href="/products">Products</a> <a href="/cart">Cart (${cartItems})</a></div>`
  //  )

  // Best Option: Create local state for the cart link.
  const cartItems = useState(cartState.value.length)
  cartState.subscribe(() => {
    cartItems.value = cartState.value.length
  })

  return createElement(
    `<div><a href="/">Home</a> <a href="/products">Products</a> <a href="/cart">Cart (<span data-state="cartItems">${cartItems.value}</span>)</a></div>`,
    {
      cartItems,
    }
  )
}

const routes = [
  { path: "/", component: Home },
  { path: "/products", component: ProductList },
  {
    path: "/products/:id",
    component: ProductDetails,
    loader: (params) => getProductDetails(params),
  },
  { path: "/cart", component: Cart },
  { path: "/checkout", component: BillingInformation },
  { path: "/checkout/shipping", component: ShippingInformation },
  { path: "/checkout/review", component: ReviewOrder },
  { path: "/confirmation", component: OrderConfirmation },
  { path: "*", component: NotFound },
]

const app = document.querySelector("#app")

const Router = createRouter(routes, app, Nav)

function getInitialProducts() {
  return [
    {
      id: "1",
      name: "Product 1",
      description: "This is the first product.",
    },
    {
      id: "2",
      name: "Product 2",
      description: "This is the second product.",
    },
    {
      id: "3",
      name: "Product 3",
      description: "This is the third product.",
    },
  ]
}

function getProductDetails(params) {
  return getInitialProducts().find((product) => product.id === params.id)
}
