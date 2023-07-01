import {
  useState,
  createElement,
  createRouter,
} from "./createElement_framework.js"

const teamData = [
  { id: 1, name: "John Doe", description: "Software Developer" },
  { id: 2, name: "Jane Smith", description: "Project Manager" },
  { id: 3, name: "Tom Brown", description: "UI/UX Designer" },
  { id: 4, name: "Alice Johnson", description: "QA Engineer" },
  { id: 5, name: "Bob Wilson", description: "DevOps Engineer" },
]

const Counter = () => {
  const count = useState(0)

  const increment = () => {
    count.value += 1
  }

  const decrement = () => {
    count.value -= 1
  }

  let element

  count.render(() => {
    const newElement = createElement("div", null, [
      createElement("p", null, [`Count: ${count.value}`]),
      createElement("button", null, ["+"], { click: increment }),
      createElement("button", null, ["-"], { click: decrement }),
    ])

    if (element && element.parentNode) {
      element.parentNode.replaceChild(newElement, element)
    }

    element = newElement
  })

  return element
}

const Home = () => {
  const homeElement = createElement("div", { id: "home" }, [
    createElement("h1", null, ["Home"]),
    createElement("p", null, ["Welcome to our website!"]),
    Counter(),
  ])

  return homeElement
}

const Nav = () => {
  const element = createElement("div", null, [
    createElement("a", { href: "/" }, ["Home"]),
    createElement("a", { href: "/about" }, ["About"]),
  ])
  return element
}

const About = () => {
  const element = createElement("div", null, [
    createElement("h1", null, ["About Us"]),
    createElement("a", { href: "/about/team" }, ["Team"]),
    createElement("a", { href: "/about/history" }, ["History"]),
  ])
  return element
}

const Team = () => {
  const element = createElement("div", null, [
    createElement("h1", null, ["Our Team"]),
  ])

  teamData.forEach((member) => {
    const link = createElement("a", { href: `/about/team/${member.id}` }, [
      member.name,
    ])
    element.appendChild(link)
    element.appendChild(createElement("br"))
  })

  return element
}

const History = () => {
  const element = createElement("div", null, [
    createElement("h1", null, ["Our History"]),
    createElement("p", null, ["Learn about our company's rich history."]),
  ])
  return element
}

const TeamMember = (props) => {
  const { name, description } = props
  const element = createElement("div", null, [
    createElement("h1", null, [name]),
    createElement("p", null, [description]),
  ])
  return element
}

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/about/team", component: Team },
  { path: "/about/history", component: History },
  { path: "/about/team", component: Team },
  {
    path: "/about/team/:id",
    component: TeamMember,
    loader: (params) => findTeamMember(params.id),
  },
]

function findTeamMember(id) {
  console.log("findTeamMember", id)
  return teamData.find((teamMember) => teamMember.id === parseInt(id))
}

const app = document.getElementById("app")
createRouter(routes, app, Nav)
