import { createElement, createRouter } from "./template_framework.js"

const userData = [
  { id: 1, name: "John Doe", age: 25, location: "New York" },
  { id: 2, name: "Jane Smith", age: 30, location: "London" },
  { id: 3, name: "Tom Brown", age: 28, location: "Tokyo" },
  { id: 4, name: "Alice Johnson", age: 32, location: "Sydney" },
  { id: 5, name: "Bob Wilson", age: 27, location: "Paris" },
]

const postCategories = [
  { id: 1, name: "Technology" },
  { id: 2, name: "Sports" },
  { id: 3, name: "Food" },
]

const userPosts = [
  {
    id: 1,
    userId: 4,
    title: "Latest Tech Trends",
    content: "Lorem ipsum dolor sit amet...",
    categoryId: 1,
  },
  {
    id: 2,
    userId: 3,
    title: "Exploring the World of AI",
    content: "Lorem ipsum dolor sit amet...",
    categoryId: 1,
  },
  {
    id: 3,
    userId: 1,
    title: "The Thrill of Sports",
    content: "Lorem ipsum dolor sit amet...",
    categoryId: 2,
  },
  {
    id: 4,
    userId: 2,
    title: "Foodie Adventures",
    content: "Lorem ipsum dolor sit amet...",
    categoryId: 3,
  },
  {
    id: 5,
    userId: 1,
    title: "Healthy Cooking Tips",
    content: "Lorem ipsum dolor sit amet...",
    categoryId: 3,
  },
]

const UserLink = (user) => `
  <a href="/about/${user.id}">${user.name}</a>
`

const UserLinks = () => userData.map((user) => UserLink(user)).join("")

const UserFilter = (user) => `
  <hr />
  <h4>Filter by Category for ${user.name}:</h4>
  <a href="/user/${user.id}/category/1">Technology</a>
  <a href="/user/${user.id}/category/2">Sports</a>
  <a href="/user/${user.id}/category/3">Food</a>
`

const Home = () =>
  createElement(`
  <div>
    <h1>Welcome to our website!</h1>
    <p>We have written some articles for you to enjoy.</p>
    <p>We are a crack team of developers, designers, and QA engineers.</p>
    <p>Click the links below to learn more about us.</p>
    ${UserLinks()}
  </div>
`)

const About = () =>
  createElement(`
  <div>
    <h1>About Us</h1>
    <p>Learn more about our website and mission.</p>
    <p>Click the links below to learn more about us.</p>
    ${UserLinks()}
  </div>
`)

const Posts = () =>
  createElement(`
  <div>
    <h1>Posts</h1>
    <p>Discover exciting articles on different subjects.</p>
    <a href="/posts/categories/1">Technology</a>
    <a href="/posts/categories/2">Sports</a>
    <a href="/posts/categories/3">Food</a>
  </div>
`)

const UserProfile = (user) => {
  if (!user) {
    return createElement("<p>User not found.</p>")
  }

  return createElement(`
      <div>
        <h2>${user.name}</h2>
        <p>Age: ${user.age}</p>
        <p>Location: ${user.location}</p>
        <a href="/posts/users/${user.id}">View Posts</a>
      </div>
    `)
}

const UserPosts = (posts) => {
  const userId = posts[0].userId
  const user = findUser(userId)

  if (!posts) {
    return createElement("<p>No posts available for " + user.name + ".</p>")
  }

  return createElement(
    `
    <div>
      <p>Posts by ${user.name}:</p>
      <ul>
        ${posts
          .map(
            (post) =>
              `<li><a href="/posts/details/${post.id}">${post.title}</a></li>`
          )
          .join("")}
      </ul>` +
      UserFilter(user) +
      `
    </div>
  `
  )
}

const PostDetails = (post) => {
  if (!post) {
    return createElement("<p>Post not found.</p>")
  }

  return createElement(`
      <div>
        <h2>${post.title}</h2>
        <p>${post.content}</p>
        <p>Category: ${
          postCategories.find((category) => category.id === post.categoryId)
            .name
        }</p>
      </div>
    `)
}

const CategoryPosts = (posts) => {
  if (posts.length === 0) {
    return createElement("<p>No posts available in this category.</p>")
  }

  return createElement(`
      <ul>
        ${posts
          .map(
            (post) =>
              `<li><a href="/posts/details/${post.id}">${post.title}</a></li>`
          )
          .join("")}
      </ul>
    `)
}

const UserCategoryPosts = (props) => {
  const { posts, user, category } = props

  if (posts.length === 0) {
    return createElement(
      "<p>No posts available for " +
        user.name +
        " in " +
        category.name +
        ".</p>" +
        UserFilter(user)
    )
  }

  return createElement(
    `
    <div>
      <p>Posts by <em>
      ${user.name}
      </em> in <strong>${
        postCategories.find((c) => c.id === posts[0].categoryId).name
      }</strong></p>
      <a href="/posts/users/${user.id}">View All Posts</a>
      <hr />
      <h4>Posts in this Category:</h4>
      <ul>
        ${posts
          .map(
            (post) =>
              `<li><a href="/posts/details/${post.id}">${post.title}</a></li>`
          )
          .join("")}
      </ul>
    ` + UserFilter(user)
  )
}

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  {
    path: "/about/:userId",
    component: UserProfile,
    loader: (params) => findUser(Number(params.userId)),
  },
  {
    path: "/posts",
    component: Posts,
  },
  {
    path: "/posts/categories",
    component: () => createElement(""),
  },
  {
    path: "/posts/categories/:categoryId",
    component: CategoryPosts,
    loader: (params) =>
      userPosts.filter((post) => post.categoryId === Number(params.categoryId)),
  },
  {
    path: "/posts/users",
    component: () => createElement(""),
  },
  {
    path: "/posts/users/:userId",
    component: UserPosts,
    loader: (params) =>
      userPosts.filter((post) => post.userId === Number(params.userId)),
  },
  {
    path: "/user",
    component: () => createElement(""),
  },
  {
    path: "/user/:userId",
    component: (user) =>
      createElement("Post Details for User: " + user.name + "."),
    loader: (params) => findUser(Number(params.userId)),
  },
  {
    path: "/user/:userId/category",
    component: () => createElement(""),
  },
  {
    path: "/user/:userId/category/:categoryId",
    component: UserCategoryPosts,
    loader: (params) =>
      findPostsByUserAndCategory(
        Number(params.userId),
        Number(params.categoryId)
      ),
  },
  {
    path: "/posts/details",
    component: () => createElement("<h3>Post Details</h3>"),
  },
  {
    path: "/posts/details/:postId",
    component: PostDetails,
    loader: (params) =>
      userPosts.find((post) => post.id === Number(params.postId)),
  },
  {
    path: "*",
    component: () => createElement("<h3>Page Not Found</h3>"),
  },
]

function findUser(userId) {
  return userData.find((member) => member.id === userId)
}

function findPostsByUserAndCategory(userId, categoryId) {
  const posts = userPosts.filter(
    (post) => post.userId === userId && post.categoryId === categoryId
  )

  const user = findUser(userId)

  const category = postCategories.find((c) => c.id === categoryId)

  return { posts, user, category }
}

const nav = () =>
  createElement(
    `
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/posts">Posts</a>
    </nav>
  `
  )

const app = document.getElementById("app")
createRouter(routes, app, nav)
