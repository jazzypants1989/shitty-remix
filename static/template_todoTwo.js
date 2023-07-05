import { createElement, useState } from "./template_framework.js"
const generateId = () => Math.random().toString(36).substring(2, 15)

const loadState = () => {
  const savedState = localStorage.getItem("todos")
  return savedState ? JSON.parse(savedState) : {}
}

const saveState = (todos) => {
  localStorage.setItem("todos", JSON.stringify(todos))
}

const Todo = ({ id, text, completed, todos }) => {
  const toggleTodo = () => {
    const updatedTodo = {
      ...todos.value[id],
      completed: !completed,
    }
    todos.value = { ...todos.value, [id]: updatedTodo }
    saveState(todos.value)
  }

  const removeTodo = () => {
    const updatedTodos = { ...todos.value }
    delete updatedTodos[id]
    todos.value = updatedTodos
    saveState(todos.value)
  }

  return createElement(
    `<div>
      <input type="checkbox" ${
        completed ? "checked" : ""
      } data-event="click" data-eventname="toggleTodo" />
      <input type="text" value="${text}" data-state="todos" />
      <button data-event="click" data-eventname="toggleTodo">Toggle</button>
      <button data-event="click" data-eventname="removeTodo">Remove</button>
    </div>`,
    {
      id,
      text,
      completed,
      todos,
      toggleTodo,
      removeTodo,
    }
  )
}

const TodoList = (todos) => {
  const todoListContainer = document.createElement("div")

  const updateTodoList = () => {
    todoListContainer.innerHTML = "" // clear existing elements

    Object.keys(todos.value).forEach((key) => {
      const todoNode = Todo({
        id: key,
        text: todos.value[key].text,
        completed: todos.value[key].completed,
        todos: todos,
      })
      todoListContainer.appendChild(todoNode)
    })
  }

  todos.subscribe(updateTodoList) // subscribe to todos state changes

  // initial render
  updateTodoList()

  return createElement(
    `<div>
      <h1>Todo List</h1>
      <div data-state="todos"></div>
    </div>`,
    {
      todos,
    },
    todoListContainer
  )
}

const App = () => {
  const todos = useState(loadState())

  const addTodo = (event) => {
    const text = event.target.previousElementSibling.value
    const newTodo = {
      text,
      completed: false,
    }
    todos.value = { ...todos.value, [generateId()]: newTodo }
    saveState(todos.value)
  }

  return createElement(
    `<div>
      <input type="text" placeholder="Add a todo" />
      <button data-event="click" data-eventname="addTodo">Add Todo</button>
      <div data-slot="TodoList"></div>
    </div>`,
    {
      todos,
      addTodo,
      TodoList: TodoList(todos),
    }
  )
}

const appElement = document.getElementById("app")
appElement.appendChild(App())
