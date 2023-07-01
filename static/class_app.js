import { Component, createRouter } from "./class_framework.js"

const app = document.getElementById("app")

const teamData = [
  { id: 1, name: "John Doe", description: "Software Developer" },
  { id: 2, name: "Jane Smith", description: "Project Manager" },
  { id: 3, name: "Tom Brown", description: "UI/UX Designer" },
  { id: 4, name: "Alice Johnson", description: "QA Engineer" },
  { id: 5, name: "Bob Wilson", description: "DevOps Engineer" },
]

class Nav extends Component {
  render() {
    const element = document.createElement("div")
    element.innerHTML = `
      <a href="/">Home</a>
      <a href="/about">About</a>
    `
    return element
  }
}

class Home extends Component {
  render() {
    const element = document.createElement("div")
    element.innerHTML = `
      <h1>Welcome to the Home Page</h1>
      <p>Click the button below to see a counter component with state.</p>
      <button id="counter-button">Show Counter</button>
    `
    const button = element.querySelector("#counter-button")
    button.addEventListener("click", () => {
      navigation.navigate("/counter")
    })
    return element
  }
}

class About extends Component {
  render() {
    const element = document.createElement("div")
    element.innerHTML = `
      <h1>About Us</h1>
      <a href="/about/team">Team</a>
      <a href="/about/history">History</a>
    `
    return element
  }
}

class Team extends Component {
  render() {
    const element = document.createElement("div")
    element.innerHTML = "<h1>Our Team</h1>"

    teamData.forEach((member) => {
      const link = document.createElement("a")
      link.href = `/about/team/${member.id}`
      link.textContent = member.name
      element.appendChild(link)
      element.appendChild(document.createElement("br"))
    })

    return element
  }
}

class History extends Component {
  render() {
    const element = document.createElement("div")
    element.innerHTML = `
      <h1>Our History</h1>
      <p>Learn about our company's rich history.</p>
    `
    return element
  }
}

class TeamMember extends Component {
  render() {
    const { name, description } = this.props
    const element = document.createElement("div")
    element.innerHTML = `
      <h1>${name}</h1>
      <p>${description}</p>
    `
    return element
  }
}

class Counter extends Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
  }

  render() {
    const { count } = this.state
    const newElement = this.createElement(`
  <div>
    <h1>Counter Component</h1>
    <p>The current count is ${count}</p>
    <button onClick="increment">+</button>
    <button onClick="decrement">-</button>
    <button onClick="reset">Reset</button>
    <br/>
    <a href="/">Go back to home</a>
  </div>
`)

    return newElement
  }

  increment() {
    this.setState({ count: this.state.count + 1 })
  }

  decrement() {
    this.setState({ count: this.state.count - 1 })
  }

  reset() {
    this.setState({ count: 0 })
  }
}

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/about/team", component: Team },
  { path: "/about/history", component: History },
  {
    path: "/about/team/:id",
    component: TeamMember,
    loader: (params) => findTeamMember(params.id),
  },
  { path: "/counter", component: Counter },
]

function findTeamMember(id) {
  return teamData.find((member) => member.id === parseInt(id))
}

const Router = createRouter(app, routes, Nav)

Router(location.pathname)

function handleNavigation(event) {
  event.intercept({
    handler() {
      const url = new URL(event.destination.url, document.baseURI)
      const path = url.pathname
      Router(path)
    },
  })
}

navigation.addEventListener("navigate", handleNavigation)
