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
      todos,
      toggleTodo,
      removeTodo,
      changeTodoText,
    }
  )
}

const TodoList = (todos) => {
  const listContainer = document.createElement("ul")

  const updateTodoList = () => {
    listContainer.innerHTML = "" // clear existing elements

    Object.keys(todos.value).forEach((key) => {
      const todoNode = Todo({
        id: key,
        text: todos.value[key].text,
        completed: todos.value[key].completed,
        todos: todos,
      })
      listContainer.appendChild(todoNode)
    })
  }

  todos.subscribe(updateTodoList) // subscribe to todos state changes

  // initial render
  updateTodoList()

  return createElement(
    `<div>
      <h1>Todo List</h1>
      <div data-slot="listContainer"></div>
    </div>`,
    {
      listContainer,
    }
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
