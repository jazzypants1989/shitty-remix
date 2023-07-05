import { createElement, useState, createRouter } from "./template_framework.js"

const Navbar = () => createElement(`<nav>Navbar Content</nav>`)
const PostTitle = (title) => createElement(`<h1>${title}</h1>`)
const AuthorInfo = (author) => createElement(`<p>Posted by: ${author}</p>`)
const PostDate = (date) => createElement(`<p>Date: ${date}</p>`)
const PostContent = (content) => createElement(`<div>${content}</div>`)
const LikeButton = (likes) => {
  let reactiveLikes = useState(likes)

  const likePost = () => {
    reactiveLikes.value += 1
  }

  return createElement(
    `<div>
            <button data-listen>Like</button>
            <p data-state="likes">Likes: ${reactiveLikes.value}</p>
        </div>`,
    {
      onClick: likePost,
      likes: reactiveLikes,
    }
  )
}

const commentsState = useState([])

const CommentBox = () => {
  const commentSubmitHandler = (event) => {
    event.preventDefault()
    const commentInput = event.target.querySelector("input")
    const newComment = commentInput.value.trim()
    if (newComment !== "") {
      commentsState.value = [...commentsState.value, newComment]
      commentInput.value = ""
    }
  }

  return createElement(
    `
      <div>
        <form data-event="submit" data-eventname="commentSubmitHandler">
            <label>Leave a comment: <input type="text" name="comment" /></label>
            <button>Submit</button>
        </form>
      </div>
    `,
    {
      commentSubmitHandler,
    }
  )
}

const CommentList = (comments) => {
  return createElement(
    `<div data-state="comments">${comments
      .map((comment) => `<p>${comment}</p>`)
      .join("")}</div>`,
    {
      comments: commentsState,
    }
  )
}

const RelatedPosts = (relatedPosts) =>
  createElement(
    `<div>${relatedPosts
      .map((post) => `<a href="/posts/${post.id}">${post.title}</a>`)
      .join("")}</div>`
  )

const Footer = () => createElement(`<footer>Footer Content</footer>`)

const BlogPostPage = (postData) => {
  const { title, author, date, content, likes, comments, relatedPosts } =
    postData

  const component = createElement(
    `
        <div>
        <div style="background-color: #aaa; padding: 10px;">
          <div data-slot="title"></div>
          <div data-slot="author"></div>
          <div data-slot="date"></div>
          <div data-slot="content"></div>
          </div>
          <div data-slot="likes"></div>
          <div data-slot="commentBox"></div>
          <div data-slot="comments"></div>
          <div data-slot="relatedPosts"></div>
          <div data-slot="footer"></div>
        </div>
      `,
    {
      title: PostTitle(title),
      author: AuthorInfo(author),
      date: PostDate(date),
      content: PostContent(content),
      likes: LikeButton(likes),
      commentBox: CommentBox(),
      comments: CommentList(comments),
      relatedPosts: RelatedPosts(relatedPosts),
      footer: Footer(),
    }
  )
  return component
}

const posts = [
  {
    id: "1",
    title: "Blog Post Title",
    author: "Author Name",
    date: "2023-07-01",
    content: "This is the blog post content.",
    likes: 5,
    comments: commentsState.value,
    relatedPosts: [
      { id: "2", title: "Related Post 1" },
      { id: "3", title: "Related Post 2" },
    ],
  },
  {
    id: "2",
    title: "Blog Post Title 2",
    author: "Author Name 2",
    date: "2023-07-01",
    content: "This is the blog post content.",
    likes: 5,
    comments: commentsState.value,
    relatedPosts: [
      { id: "2", title: "Related Post 1" },
      { id: "3", title: "Related Post 2" },
    ],
  },
]

const Home = () => createElement(`<a href="/posts/1">Blog Post</a>`)

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/posts",
    component: Home,
  },
  {
    path: "/posts/:id",
    component: BlogPostPage,
    loader: (params) => findPost(params.id),
  },
]

function findPost(id) {
  const post = posts.find((post) => post.id === id)
  return post
}

const app = document.getElementById("app")
createRouter(routes, app, Navbar)
