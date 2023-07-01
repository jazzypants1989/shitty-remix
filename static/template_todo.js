import { createElement, createRouter, useState } from "./template_framework.js"

const routes = [
  { path: "/", component: Home },
  { path: "/create", component: Create },
  { path: "/edit", component: Edit },
  {
    path: "/edit/:id",
    component: EditItem,
    loader: (params) => ({
      todo: todoList.value.find((todo) => todo.id === params.id),
    }),
  },
]

const app = document.getElementById("app")
const [todoList, setTodoList] = useState([])
const Router = createRouter(routes, app, nav)

function Home() {
  return createElement(
    `
      <div>
        <h1>Todo List</h1>
        <ul>
          ${todoList.value
            .map(
              (todo) => `<li>
          <a href="/edit/${todo.id}">${todo.text}</a>
          </li>`
            )
            .join("")}
        </ul>
        <button data-event="click" data-eventname="goToCreate">Create Todo</button>
      </div>
    `,
    { goToCreate: () => Router("/create") }
  )
}

function Create() {
  let inputValue = ""

  const inputChange = (event) => {
    inputValue = event.target.value
  }

  const handleCreateTodo = () => {
    if (inputValue.trim() !== "") {
      const newTodo = {
        id: generateId(),
        text: inputValue.trim(),
      }
      setTodoList([...todoList.value, newTodo])
    }

    inputValue = ""

    Router("/")
  }

  return createElement(
    `
    <div>
      <h1>Create Todo</h1>
      <input type="text" data-event="input" data-eventname="inputChange" />
      <button data-event="click" data-eventname="handleCreateTodo">Add Todo</button>
      <button data-event="click" data-eventname="goToHome">Cancel</button>
    </div>
  `,
    { inputChange, handleCreateTodo, goToHome: () => Router("/") }
  )
}

function Edit() {
  const noTodos = todoList.value.length === 0
  return createElement(
    `
    <div>
        <h1>Edit Todo</h1>
        ${
          noTodos ? "<p>No todos to edit.</p>" : "<p>Select a todo to edit.</p>"
        }
        ${noTodos ? "" : "<ul>"}
        ${todoList.value
          .map(
            (todo) => `<li>
            <a href="/edit/${todo.id}">${todo.text}</a>
            </li>`
          )
          .join("")}
        ${noTodos ? "" : "</ul>"}
        <button data-event="click" data-eventname="goToHome">Cancel</button>
    </div>
    `,
    { goToHome: () => Router("/") }
  )
}

function EditItem(props) {
  let inputValue = props?.todo?.text

  if (!props.todo) {
    location.pathname = "/edit"
    return
  }

  const inputChange = (event) => {
    inputValue = event.target.value
  }

  const updateTodo = () => {
    if (inputValue.trim() !== "") {
      const updatedTodo = {
        ...props.todo,
        text: inputValue.trim(),
      }
      const updatedList = todoList.value.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo
      )
      setTodoList(updatedList)
    }

    Router("/edit")
  }

  const deleteTodo = () => {
    const updatedList = todoList.value.filter(
      (todo) => todo.id !== props.todo.id
    )
    setTodoList(updatedList)

    Router("/edit")
  }

  return createElement(
    `
          <div>
            <input type="text" data-event="input" data-eventname="inputChange" value="${inputValue}" />
            <button data-event="click" data-eventname="updateTodo">Update Todo</button>
            <button data-event="click" data-eventname="deleteTodo">Delete Todo</button>
            <button data-event="click" data-eventname="goToHome">Cancel</button>
          </div>
      `,
    {
      inputChange,
      updateTodo,
      deleteTodo,
      goToHome: () => Router("/"),
    }
  )
}

function nav() {
  return createElement(`
    <nav>
        <a href="/">Home</a>
        <a href="/create">Create</a>
        <a href="/edit">Edit</a>
    </nav>
  `)
}

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}
