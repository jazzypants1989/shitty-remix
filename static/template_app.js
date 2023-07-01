import { useState, createElement, createRouter } from "./template_framework.js"

const teamData = [
  { id: 1, name: "John Doe", description: "Software Developer" },
  { id: 2, name: "Jane Smith", description: "Project Manager" },
  { id: 3, name: "Tom Brown", description: "UI/UX Designer" },
  { id: 4, name: "Alice Johnson", description: "QA Engineer" },
  { id: 5, name: "Bob Wilson", description: "DevOps Engineer" },
]

const Counter = () => {
  const countOne = useState(0)
  const countTwo = useState(0)

  const incrementOne = () => (countOne.value += 1)

  const decrementOne = () => (countOne.value -= 1)

  const incrementTwo = () => (countTwo.value += 2)

  const decrementTwo = () => (countTwo.value -= 2)

  const render = () =>
    createElement(
      `<div>
        <h2>Counters!!</h2>
        <button data-event="click" data-eventname="decrementOne">-1</button>
        <p data-state="countOne"></p>
        <button data-event="click" data-eventname="incrementOne">+1</button>
        <hr />
        <button data-event="click" data-eventname="decrementTwo">-2</button>
        <p data-state="countTwo"></p>
        <button data-event="click" data-eventname="incrementTwo">+2</button>
      </div>`,
      {
        countOne,
        countTwo,
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
      <a href="/search">Search</a>
      <a href="/mood">Mood</a>
      <a href="/example/Wow!!/Cool!!">Example</a>
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

const SearchComponent = () => {
  const render = () =>
    createElement(
      `<div>
        <h2>Search:</h2>
        <input type="text" data-listen placeholder="Type your search term..."/>
        <p id="searchDisplay"></p>
      </div>`,
      {
        onInput: (event) => {
          const searchTerm = event.target.value
          const searchDisplay = document.querySelector("#searchDisplay")
          if (searchDisplay) {
            searchDisplay.innerText = searchTerm
          }
        },
      }
    )

  return render()
}

const MoodComponent = () => {
  const mood = useState("happy")

  mood.subscribe((newMood) => {
    const moodElement = document.querySelector("#moodText")
    if (moodElement) {
      if (newMood === "happy") {
        moodElement.style.color = "green"
      } else if (newMood === "sad") {
        moodElement.style.color = "blue"
      } else {
        moodElement.style.color = "black"
      }
    }
  })

  const setMoodToHappy = () => (mood.value = "happy")

  const setMoodToSad = () => (mood.value = "sad")

  const render = () =>
    createElement(
      `<div>
        <h2 id="moodText">I'm currently feeling <span data-state="mood">${mood.value}</span></h2>
        <button data-listen>Happy</button>
        <button data-listen>Sad</button>
      </div>`,
      {
        onClick: (event) => {
          if (event.target.innerText === "Happy") {
            setMoodToHappy()
          } else if (event.target.innerText === "Sad") {
            setMoodToSad()
          }
        },
        mood,
      }
    )

  return render()
}

const Example = (props) => {
  if (!props?.thatOne && !props?.thisOne) {
    return createElement(`
<div>
  <h1>Example Page</h1>
  <strong>Nothing to see here.</strong>
</div>
`)
  } else if (!props?.thisOne) {
    return createElement(`
<div>
  <h1>Example Page</h1>
  <p>That: ${props?.thatOne}</p>
</div>
`)
  } else if (!props?.thatOne) {
    return createElement(`
<div>
  <h1>Example Page</h1>
  <p>This: ${props?.thisOne}</p>
</div>
`)
  } else {
    return createElement(`
<div>
  <h1>Example Page</h1>
  <p>This: ${props?.thisOne}</p>
  <p>That: ${props?.thatOne}</p>
</div>
`)
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
  { path: "/search", component: SearchComponent },
  { path: "/mood", component: MoodComponent },
  {
    path: "/example",
    component: Example,
    loader: (params) => params,
  },
  {
    path: "/example/:thisOne",
    component: Example,
    loader: (params) => params,
  },
  {
    path: "/example/:thatOne",
    component: Example,
    loader: (params) => params,
  },
  {
    path: "/example/:thisOne/:thatOne",
    component: Example,
    loader: (params) => params,
  },
]

function findTeamMember(id) {
  return teamData.find((teamMember) => teamMember.id === parseInt(id))
}

const app = document.getElementById("app")
createRouter(routes, app, Nav)
