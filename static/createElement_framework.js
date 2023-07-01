export const useState = (initialState) => {
  let state = initialState
  const listeners = []

  return {
    get value() {
      return state
    },
    set value(v) {
      state = v
      listeners.forEach((listener) => listener())
    },
    render(renderFunc) {
      listeners.push(renderFunc)
      renderFunc()
    },
  }
}

export const createElement = (type, props, children, events) => {
  const element = document.createElement(type)

  if (props) {
    Object.keys(props).forEach((key) => {
      element[key] = props[key]
    })
  }

  if (events) {
    Object.keys(events).forEach((event) => {
      element.addEventListener(event, events[event])
    })
  }

  if (children) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child))
      } else {
        element.appendChild(child)
      }
    })
  }

  return element
}

export const createRouter = (routes, app, nav = null) => {
  const matchPath = (currentPath, routePath) => {
    const currentParts = currentPath.split("/")
    const routeParts = routePath.split("/")
    return (
      currentParts.length === routeParts.length &&
      currentParts.every(
        (currentPart, i) =>
          routeParts[i].startsWith(":") || currentPart === routeParts[i]
      )
    )
  }

  const extractParams = (currentPath, routePath) => {
    const currentParts = currentPath.split("/")
    const routeParts = routePath.split("/")
    const params = {}

    currentParts.forEach((currentPart, i) => {
      const routePart = routeParts[i]

      if (routePart.startsWith(":")) {
        params[routePart.slice(1)] = currentPart
      }
    })

    return params
  }

  const Router = (path) => {
    app.innerHTML = ""
    if (nav) app.appendChild(nav())

    const homeRoute = routes.find((route) => route.path === "/")
    if (path === "/") {
      if (homeRoute) app.appendChild(homeRoute.component())
      else console.error("Component not found")
      return
    }

    const pathParts = path.split("/").filter(Boolean)
    let currentPath = ""
    pathParts.forEach((part) => {
      currentPath += `/${part}`
      const route = routes.find((route) => matchPath(currentPath, route.path))
      if (route) {
        if (route.path.includes("/:")) {
          const params = extractParams(currentPath, route.path)
          const componentProps = route.loader ? route.loader(params) : {}
          const component = route.component(componentProps)
          app.appendChild(component)
        } else {
          app.appendChild(route.component())
        }
      } else {
        console.error("Component not found")
      }
    })
  }

  const navigateHandler = (event) => {
    const { pathname } = new URL(event.destination.url)
    event.intercept({ handler: () => Router(pathname) })
  }

  navigation.addEventListener("navigate", navigateHandler)

  Router(location.pathname)
}
