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

  const stateObject = {
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

  return [stateObject, setState]
}

export const bindEventListeners = (element, props) => {
  if (!props || typeof props !== "object") return

  const eventElements = element.querySelectorAll("[data-event]")

  eventElements.forEach((eventElement) => {
    const eventType = eventElement.getAttribute("data-event")
    const eventHandlerName = eventElement.getAttribute("data-eventname")

    if (
      eventType &&
      eventHandlerName &&
      typeof props[eventHandlerName] === "function"
    ) {
      eventElement.addEventListener(eventType, (event) => {
        event.preventDefault()
        props[eventHandlerName](event)
      })
    }
  })
}

export const createElement = (template, props, ...children) => {
  if (typeof template === "function") {
    return template(props)
  }

  if (typeof template !== "string") {
    throw new Error("Invalid element template. Expected a string.")
  }

  const element = document.createElement("template")
  element.innerHTML = template.trim()
  const fragment = element.content.cloneNode(true)

  const processNode = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      bindEventListeners(node, props)

      if (node.hasAttribute("data-state")) {
        const stateName = node.getAttribute("data-state")
        if (props[stateName]) {
          node.textContent = props[stateName].value
          props[stateName].bindElement(node)
        }
      }
    }

    if (node.childNodes && node.childNodes.length) {
      Array.from(node.childNodes).forEach(processNode)
    }
  }

  processNode(fragment)

  if (props) {
    const target = fragment.querySelector("*")
    Object.keys(props).forEach((key) => {
      if (key.startsWith("on") && typeof props[key] === "function") {
        const eventName = key.slice(2).toLowerCase()
        Array.from(target.querySelectorAll("*"))
          .filter((eventElement) => !eventElement.hasAttribute("data-rendered"))
          .forEach((eventElement) => {
            eventElement.addEventListener(eventName, props[key])
            eventElement.setAttribute("data-rendered", "true")
          })
      } else {
        target.setAttribute(key, props[key])
      }
    })
  }

  if (children) {
    children.forEach((child) => {
      const node =
        typeof child === "string" ? document.createTextNode(child) : child
      fragment.querySelector("*").appendChild(node)
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
      const navElement = nav()
      app.appendChild(navElement)
    }

    const homeRoute = routes.find((route) => route.path === "/")
    if (path === "/") {
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
            console.error("Component not found")
          }
        } else {
          const routeComponent = route.component()
          if (routeComponent) {
            app.appendChild(routeComponent)
          } else {
            console.error("Component not found")
          }
        }
      } else {
        console.error("this is what we're asking for:", currentPath)
        console.error("this is what we have:", routes)
        console.error("maybe this is the problem:", route)
      }
    })
  }

  const navigateHandler = (event) => {
    const { pathname } = new URL(event.destination.url)
    event.intercept({ handler: () => Router(pathname) })
  }

  navigation.addEventListener("navigate", navigateHandler)

  Router(location.pathname)
  return Router
}
