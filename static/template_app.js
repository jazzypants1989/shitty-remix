import { useState, createElement, createRouter } from "./template_framework.js"

const teamData = [
  { id: 1, name: "John Doe", description: "Software Developer" },
  { id: 2, name: "Jane Smith", description: "Project Manager" },
  { id: 3, name: "Tom Brown", description: "UI/UX Designer" },
  { id: 4, name: "Alice Johnson", description: "QA Engineer" },
  { id: 5, name: "Bob Wilson", description: "DevOps Engineer" },
]

const Counter = () => {
  const [counterOne, setCounterOne] = useState(0)
  const [counterTwo, setCounterTwo] = useState(0)

  const incrementOne = () => {
    setCounterOne(counterOne.value + 1)
    console.log(counterOne.value)
  }

  const decrementOne = () => {
    setCounterOne(counterOne.value - 1)
    console.log(counterOne.value)
  }

  const incrementTwo = () => {
    setCounterTwo(counterTwo.value + 2)
  }

  const decrementTwo = () => {
    setCounterTwo(counterTwo.value - 2)
  }

  const render = () =>
    createElement(
      `<div>
        <h2>Counter</h2>
        <p data-state="counterOne">Counter One: ${counterOne.value}</p>
        <button data-event="click" data-eventname="incrementOne">+1</button>
        <button data-event="click" data-eventname="decrementOne">-1</button>
        <p data-state="counterTwo">Counter Two: ${counterTwo.value}</p>
        <button data-event="click" data-eventname="incrementTwo">+2</button>
        <button data-event="click" data-eventname="decrementTwo">-2</button>
      </div>`,
      {
        counterOne,
        counterTwo,
        incrementOne,
        decrementOne,
        incrementTwo,
        decrementTwo,
      }
    )

  return render()
}

const Home = () =>
  createElement(
    `<div id="home">
        <h1>Home</h1>
        <p>Welcome to our website!</p>
      </div>`,
    null,
    Counter()
  )

const Nav = () =>
  createElement(`
    <div>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </div>
  `)

const About = () =>
  createElement(`
    <div>
      <h1>About Us</h1>
      <a href="/about/team">Team</a>
      <a href="/about/history">History</a>
    </div>
  `)

const Team = () => {
  const teamMembers = teamData
    .map(
      (member) => `<a href="/about/team/${member.id}">${member.name}</a><br>`
    )
    .join("")

  return createElement(`
    <div>
      <h1>Our Team</h1>
      ${teamMembers}
    </div>
  `)
}

const History = () =>
  createElement(`
    <div>
      <h1>Our History</h1>
      <p>Learn about our company's rich history.</p>
    </div>
  `)

const TeamMember = (props) => {
  const { name, description } = props

  return createElement(`
    <div>
      <h1>${name}</h1>
      <p>${description}</p>
    </div>
  `)
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
]

function findTeamMember(id) {
  return teamData.find((teamMember) => teamMember.id === parseInt(id))
}

const app = document.getElementById("app")
createRouter(routes, app, Nav)
