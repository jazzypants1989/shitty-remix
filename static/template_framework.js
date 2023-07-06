export const useState = (initialState) => {
  if (typeof initialState === "function") {
    initialState = initialState()
  }
  let state = initialState
  const listeners = []

  const setState = (newValue) => {
    state = newValue
    listeners.forEach((listener) => listener(state))
  }
  
  return {
    get value() {
      return state
    },
    set value(newValue) {
      setState(newValue)
    },
    subscribe: (listener) => {
      listeners.push(listener)
    },
  }
}

const renderArrayOrObject = (element, value) => {
  element.innerHTML = ""

  const renderNode = (node, parentNode) => {
    if (Array.isArray(node)) {
      node.forEach((item) => {
        const childNode = document.createElement("section")
        renderNode(item, childNode)
        parentNode.appendChild(childNode)
      })
    } else if (typeof node === "object") {
      Object.keys(node).forEach((key) => {
        const childNode = document.createElement("section")
        childNode.textContent = `${key}:`
        renderNode(node[key], childNode)
        parentNode.appendChild(childNode)
      })
    } else {
      parentNode.textContent = node
    }
  }

  renderNode(value, element)
}

const bindEventListener = (element, eventName, handler) => {
  if (element && typeof handler === "function") {
    element.removeEventListener(eventName, handler)
    element.addEventListener(eventName, (event) => {
      handler(event)
    })
  }
}

const bindEventListeners = (element, props) => {
  if (!props || typeof props !== "object") return;

  const eventElements = element.querySelectorAll("[data-event]");
  eventElements.forEach((eventElement) => {
    const eventType = eventElement.getAttribute("data-event");
    const eventHandlerName = eventElement.getAttribute("data-eventname");

    if (eventHandlerName && props[eventHandlerName]) {
      bindEventListener(eventElement, eventType, props[eventHandlerName]);
    }
  });

  Object.keys(props).forEach((key) => {
    if (key.startsWith("on") && typeof props[key] === "function") {
      const eventName = key.slice(2).toLowerCase();
      const eventElements = Array.from(
        element.querySelectorAll(`*[data-listen]`)
      );
      
      eventElements.forEach((eventElement) => {
        bindEventListener(eventElement, eventName, props[key]);
      });
    }
  });
};

const processNode = (node, props) => {
  const processState = (node, newState) => {
    if (Array.isArray(newState) || typeof newState === "object") {
      console.log("rendering array or object", newState)
      renderArrayOrObject(node, newState)
    } else {
      node.textContent = newState
    }
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const stateName = node.getAttribute("data-state")
    if (node.hasAttribute("data-state") && props[stateName]) {
      const stateValue = props[stateName].value
      processState(node, stateValue)
      props[stateName].subscribe((newState) => {
        processState(node, newState)
      });
    }
  }

  if (node.childNodes && node.childNodes.length) {
    Array.from(node.childNodes).forEach((childNode) =>
      processNode(childNode, props)
    )
  }
}


const processSlots = (fragment, props) => {
  const slotElements = Array.from(fragment.querySelectorAll("[data-slot]"))
  slotElements.forEach((slotElement) => {
    const slotName = slotElement.getAttribute("data-slot")
    const slotContent = props[slotName]
    if (slotContent) {
      slotElement.innerHTML = ""
      if (Array.isArray(slotContent)) {
        slotContent.forEach((content) => {
          const node =
            typeof content === "string"
              ? document.createTextNode(content)
              : content
          slotElement.appendChild(node)
        })
      } else {
        const node =
          typeof slotContent === "string"
            ? document.createTextNode(slotContent)
            : slotContent
        slotElement.appendChild(node)
      }
    }
  })
}

export const createElement = (template, props) => {
  if (typeof template === "function") return template(props)
  if (typeof template !== "string")
    throw new Error("Invalid element template. Expected a string.")

    const element = document.createElement("template")
    element.innerHTML = template.trim()
    const fragment = element.content.cloneNode(true)
    processNode(fragment, props)

    if (props) {
      bindEventListeners(fragment, props)
      processSlots(fragment, props)
    }

    return fragment
}

export const createComponent = (factory, state) => {
  let rootElement = factory().firstElementChild;

  const updateContainer = () => {
    const newElement = factory().firstElementChild;
    rootElement.replaceWith(newElement);
    rootElement = newElement;
  }

  state.subscribe(updateContainer);

  return rootElement;
}

export const createContainer = (type, factory, state) => {
  const container = document.createElement(type)

  const updateContainer = () => {
    container.innerHTML = ""
    const elements = factory()
    if (Array.isArray(elements)) {
      elements.forEach((element) => container.appendChild(element))
    } else if (elements) {
      container.appendChild(elements)
    }
  }

  state.subscribe(updateContainer)
  updateContainer()

  return container
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
    if (shouldNotIntercept(event)) return
    const { pathname } = new URL(event.destination.url)
    event.intercept({ handler: () => Router(pathname) })
  }

  navigation.addEventListener("navigate", navigateHandler)

  Router(location.pathname)

  Router.refresh = () => {
    Router(location.pathname)
  }

  Router.push = (path) => {
    navigation.navigate(path)
  }

  Router.replace = (path) => {
    navigation.navigate(path, { history: "replace" })
  }

  return Router
}

function shouldNotIntercept(event) {
  return (
    !event.canIntercept ||
    event.hashChange ||
    event.downloadRequest ||
    event.formData
  )
}
