var fancyConsole = function () {
  let documentation =
`
# Welcome to fancyConsole

This project parses markdown strings and makes them look fancy in the browser console.
`
  let state = {}
  let handler = {
    set: (state, property, value) => {

      if (property === 'documentation') {

        let lines = documentation.split('\n')

        

      }

    }
  }
  let proxy = new Proxy(state, handler)

  proxy.documentation = documentation

  return proxy

}

// try to make commonjs module for browserify and others
try {
  module.exports = fancyConsole
} catch (e) {

}
