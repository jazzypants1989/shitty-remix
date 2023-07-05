import { createContainer, createElement, useState } from "./template_framework.js"
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

  const changeTodoText = (event) => {
    event.preventDefault()
    const text = event.target.elements.text.value
    const updatedTodo = {
      ...todos.value[id],
      text,
    }
    todos.value = { ...todos.value, [id]: updatedTodo }
    saveState(todos.value)
  }

  return createElement(
    `<li>
      <form data-event="submit" data-eventname="changeTodoText" />
        <input type="text" value="${text}" name="text" />
        <button type="submit">Change Text</button>
        <label>Completed: </label>
      <input type="checkbox" ${
        completed ? "checked" : ""
      } data-event="click" data-eventname="toggleTodo" name="completed" />
      <button type="button" data-event="click" data-eventname="removeTodo">Remove</button>
      </form>
    </li>`,
    {
      id,
      text,
      completed,
      toggleTodo,
      removeTodo,
      changeTodoText,
    }
  )
}

const App = () => {
  const todos = useState(loadState())

  const addTodo = () => {
    const text = todoInput.value
    const newTodo = {
      text,
      completed: false,
    }
    todos.value = { ...todos.value, [generateId()]: newTodo }
    saveState(todos.value)
  }

  const renderTodos = () => Object.keys(todos.value).map((key) =>
      Todo({
        id: key,
        text: todos.value[key].text,
        completed: todos.value[key].completed,
        todos: todos,
      })
    )
  
  const TodoList = createContainer("ul", renderTodos, todos)

  return createElement(
    `<div>
      <input type="text" placeholder="Add a todo" id="todoInput" />
      <button data-event="click" data-eventname="addTodo">Add Todo</button>
      <div data-slot="TodoList"></div>
    </div>`,
    {
      todos,
      addTodo,
      TodoList
    }
  )
}

const appElement = document.getElementById("app")
appElement.appendChild(App())
