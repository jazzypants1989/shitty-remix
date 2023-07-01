export const useState = (initialState) => {
  let state = initialState
  const listeners = []
  const boundElements = new Set()

  const getState = () => state

  const setState = (newValue) => {
    state = newValue
    listeners.forEach((listener) => listener(state))
    boundElements.forEach((element) => {
      element.textContent = state
    })
  }

  return {
    get value() {
      return getState()
    },
    set value(newValue) {
      setState(newValue)
    },
    subscribe: (listener) => {
      listeners.push(listener)
    },
    bindElement: (element) => {
      boundElements.add(element)
    },
  }
}

const bindEventListener = (element, eventName, handler) => {
  if (element && typeof handler === "function") {
    element.addEventListener(eventName, (event) => {
      event.preventDefault()
      handler(event)
    })
  }
}

const bindEventListeners = (element, props) => {
  if (!props || typeof props !== "object") return

  const eventElements = element.querySelectorAll("[data-event]")

  eventElements.forEach((eventElement) => {
    const eventType = eventElement.getAttribute("data-event")
    const eventHandlerName = eventElement.getAttribute("data-eventname")

    bindEventListener(eventElement, eventType, props[eventHandlerName])
  })
}

const bindEventListenerToAttribute = (
  target,
  attribute,
  eventName,
  handler
) => {
  const eventElements = Array.from(target.querySelectorAll(`*[${attribute}]`))
  eventElements.forEach((eventElement) => {
    eventElement.addEventListener(eventName, handler)
    eventElement.setAttribute("data-rendered", "true")
  })
}

const applyPropsToTarget = (target, props) => {
  Object.keys(props).forEach((key) => {
    if (key.startsWith("on") && typeof props[key] === "function") {
      const eventName = key.slice(2).toLowerCase()
      bindEventListenerToAttribute(target, "data-listen", eventName, props[key])
    } else {
      target.setAttribute(key, props[key])
    }
  })
}

const processNode = (node, props) => {
  if (node.nodeType === Node.ELEMENT_NODE) {
    bindEventListeners(node, props)
    const stateName = node.getAttribute("data-state")
    if (node.hasAttribute("data-state") && props[stateName]) {
      node.textContent = props[stateName].value
      props[stateName].bindElement(node)
    }
  }

  if (node.childNodes && node.childNodes.length) {
    Array.from(node.childNodes).forEach((childNode) =>
      processNode(childNode, props)
    )
  }
}

export const createElement = (template, props, ...children) => {
  if (typeof template === "function") return template(props)
  if (typeof template !== "string")
    throw new Error("Invalid element template. Expected a string.")

  const element = document.createElement("template")
  element.innerHTML = template.trim()
  const fragment = element.content.cloneNode(true)
  processNode(fragment, props)

  if (props) {
    const target = fragment.querySelector("*")
    applyPropsToTarget(target, props)
  }

  if (children) {
    const target = fragment.querySelector("*")
    children.forEach((child) => {
      const node =
        typeof child === "string" ? document.createTextNode(child) : child
      target.appendChild(node)
    })
  }

  return fragment
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

    if (nav) {
      app.appendChild(nav())
    }

    const homeRoute = routes.find((route) => route.path === "/")
    if (path === "/" || path === "") {
      if (homeRoute) {
        const homeComponent = homeRoute.component()
        app.appendChild(homeComponent)
      } else {
        console.error("Component not found")
      }
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
          if (component) {
            app.appendChild(component)
          } else {
            app.innerHTML = ""
            app.appendChild(nav())
            app.appendChild(createElement("<h1>404 Not Found.</h1>"))
            console.error(
              "Component not found",
              route,
              component,
              componentProps,
              params
            )
          }
        } else {
          const routeComponent = route.component()
          if (routeComponent) {
            app.appendChild(routeComponent)
          } else {
            app.innerHTML = ""
            app.appendChild(nav())
            app.appendChild(createElement("<h1>404 Not Found.</h1>"))
            console.error("Component not found", route, routeComponent)
          }
        }
      } else {
        console.log("Not found", currentPath)
        const notFoundRoute = routes.find((route) => route.path === "*")
        if (notFoundRoute) {
          const notFoundComponent = notFoundRoute.component()
          app.appendChild(notFoundComponent)
        }
        console.error("Component not found", route)
        console.log("This is what we have", routes)
        console.log("This is what we might need", notFoundRoute)
      }
    })

    if (path !== location.pathname) {
      history.pushState({}, "", path)
    }
  }

  const navigateHandler = (event) => {
    const { pathname } = new URL(event.destination.url)
    event.intercept({ handler: () => Router(pathname) })
  }

  navigation.addEventListener("navigate", navigateHandler)

  Router(location.pathname)

  Router.refresh = () => {
    Router(location.pathname)
  }

  return Router
}
