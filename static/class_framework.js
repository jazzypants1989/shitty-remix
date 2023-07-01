export class Component {
  constructor(props) {
    this.props = props
    this.state = {}
    this.element = null
  }

  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.render()
    this.mount()
  }

  render() {
    throw new Error("Render method must be implemented")
  }

  createElement(template) {
    const div = document.createElement("div")
    div.innerHTML = template.trim()
    return div.firstChild
  }

  addEventListeners(element) {
    const eventHandlerElements = Array.from(element.getElementsByTagName("*"))
    eventHandlerElements.push(element)

    eventHandlerElements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith("on")) {
          const eventType = attr.name.slice(2).toLowerCase()
          if (this[attr.value]) {
            el.removeAttribute(attr.name)
            el.addEventListener(eventType, this[attr.value].bind(this))
          }
        }
      })
    })
  }

  mount() {
    const template = this.render()
    let newElement
    if (typeof template === "string") {
      newElement = this.createElement(template)
    } else {
      newElement = template
    }

    this.addEventListeners(newElement)

    if (this.element) {
      app.replaceChild(newElement, this.element)
    } else {
      app.appendChild(newElement)
    }

    this.element = newElement
  }
}

function matchPath(currentPath, routePath) {
  const currentParts = currentPath.split("/")
  const routeParts = routePath.split("/")

  if (currentParts.length !== routeParts.length) {
    return false
  }

  for (let i = 0; i < currentParts.length; i++) {
    const currentPart = currentParts[i]
    const routePart = routeParts[i]

    if (!routePart.startsWith(":") && currentPart !== routePart) {
      return false
    }
  }

  return true
}

function extractParams(currentPath, routePath) {
  const currentParts = currentPath.split("/")
  const routeParts = routePath.split("/")
  const params = {}

  for (let i = 0; i < currentParts.length; i++) {
    const routePart = routeParts[i]

    if (routePart.startsWith(":")) {
      const paramName = routePart.slice(1)
      const paramValue = currentParts[i]
      params[paramName] = paramValue
    }
  }

  return params
}

export function createRouter(app, routes, Nav) {
  return function Router(path) {
    app.innerHTML = ""

    if (Nav) {
      const nav = new Nav()
      nav.mount()
    }

    if (path === "/") {
      const HomeComponent = routes.find((route) => route.path === "/").component
      const component = new HomeComponent()
      component.mount()
      return
    }

    const pathParts = path.split("/").filter(Boolean)

    let currentPath = ""
    for (const part of pathParts) {
      currentPath += `/${part}`
      const route = routes.find((route) => matchPath(currentPath, route.path))
      if (route) {
        const params = extractParams(currentPath, route.path)
        if (route.loader) {
          const data = route.loader(params)
          if (data) {
            const component = new route.component(data)
            component.mount()
          } else {
            console.error("Data not found")
          }
        } else {
          const component = new route.component()
          component.mount()
        }
      } else {
        console.error("Component not found")
      }
    }
  }
}
