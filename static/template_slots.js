import { createElement, useState, createRouter } from "./template_framework.js"

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

  return createElement(
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

const Posts = () => createElement(`<a href="/posts/1">Blog Post</a>`)

const UserCard = ({ name, email, avatar }) => {
  const element = createElement(
      `<div>
      <img src="${avatar}" alt="${name}" />
      <h3>${name}</h3>
      <p>${email}</p>
      </div>`
  );

return element;
};

const user1 = {
name: 'John Doe',
email: 'johndoe@example.com',
avatar: 'https://picsum.photos/seed/1/200/300',
};

const user2 = {
name: 'Jane Smith',
email: 'janesmith@example.com',
avatar: 'https://picsum.photos/seed/2/200/300',
};

const Pictures = () => {
  const element = createElement(`<div>
    <div data-slot="slot1"></div>
    <div data-slot="slot2"></div>
  </div>`, {
    slot1: UserCard(user1),
    slot2: UserCard(user2),
  });

  return element;
};

const routes = [
  {
    path: "/",
    component: () => createElement(`<h1>Home</h1>`),
  },
  {
    path: "/posts",
    component: Posts,
  },
  {
    path: "/posts/:id",
    component: BlogPostPage,
    loader: (params) => findPost(params.id),
  },
  {
    path: "/pictures",
    component: Pictures,
  }
]

function findPost(id) {
  const post = posts.find((post) => post.id === id)
  return post
}

const Navbar = () =>
  createElement(
    `<nav>  
    <a href="/">Home</a>  
    <a href="/posts">Posts</a>
    <a href="/pictures">Pictures</a>
  </nav>`
  )

const app = document.getElementById("app")
createRouter(routes, app, Navbar)
