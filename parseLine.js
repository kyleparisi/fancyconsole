var parseInline = (line, style) => {

  style = style || ''
  var bold = /(.*)(\*\*|__)(.*)(\*\*|__)(.*)/
  var italics = /(.*)(\*|_)(.*)(\*|_)(.*)/

  switch (true) {

    // BOLD
    case bold.test(line):
      // ignore horizontal rule
      if (line === '***') return false

      // TODO(kyle): this is not the way to do this.
      // Regex is needed to do proper selections.
      words = line.split(' ')

      return words.map((chars, index) => {

        // if first element don't add space to start
        if (index) {
          var parsed = [' ']
        } else {
          var parsed = ['']
        }

        if (/(\*\*|__)(.*)(\*\*|__)/.test(chars)) {
          parsed[0] += '%c%s'
          parsed.push(...[
            style + 'font-weight: bold;',
            chars.replace(/(\*\*|__)/g, '')
          ])

          if (index === (words.length - 1)) {
            parsed[0] += '\n'
          }
          return parsed
        }

        if (index === (words.length - 1)) {
          parsed[0] += '\n'
        }
        parsed[0] += '%c%s'
        parsed.push(...['', chars])

        return parsed
      })
      break;

    // ITALICS
    case italics.test(line):
      // ignore horizontal rule
      if (line === '***') return false

      words = line.split(' ')

      return words.map((chars, index) => {

        // if first element don't add space to start
        if (index) {
          var parsed = [' ']
        } else {
          var parsed = ['']
        }

        if (/(\*|_)(.*)(\*|_)/.test(chars)) {
          parsed[0] += '%c%s'
          parsed.push(...[
            style + 'font-style: italic;',
            chars.replace(/(\*|_)/g, '')
          ])

          if (index === (words.length - 1)) {
            // parsed[0] += '\n'
          }
          return parsed
        }

        if (index === (words.length - 1)) {
          // parsed[0] += '\n'
        }
        parsed[0] += '%c%s'
        parsed.push(...['', chars])

        return parsed
      })
      break;
    default:
      return false
  }
}

var something = (value, style, state) => {

  var inLine = parseInline(value, style)

  if (inLine) {
    return inLine.map(line => {
      state.parsed[0] += line[0]
      line.shift()
      line[0] = line[0] + style
      return line
    })
  } else {
    state.parsed[0] += '%c%s\n'
    return [[
      style,
      value
    ]]

  }

  return state
}

var parseLine = () => {

  let state = {}
  let handler = {
    set: (state, property, value) => {

      if (property === 'line') {

        state.parsed = state.parsed || ['']

        switch (true) {

          // CODE BLOCK
          case /^    (.*)/.test(value):
            state.parsed[0] += '%c%s\n'
            var styleAndValue = [
              `background: #F1F1F1;
              border: 1px solid #F1F1F1;
              font-size: 90%;`,
              value.replace('    ', '')
            ]
            state.parsed.push(...styleAndValue)
            return
            break;

          // HR
          case /^(---|\*\*\*)/.test(value):
            state.parsed[0] += '%c%s\n'
            var line = ''
            if (document.body.clientWidth <= 400) {
              var factor = (document.body.clientWidth / 8.0)
            } else {
              var factor = (document.body.clientWidth / 7.5)
            }
            for (var i = 0; i < factor; i++) {
              line += '_'
            }
            var styleAndValue = [
              ``,
              line
            ]
            state.parsed.push(...styleAndValue)
            return
            break;

          // UL
          case /^(\*|-) (.*)/.test(value):
            var style = `display: list-item;
            list-style: square outside none;`
            // state.parsed[0] += '%c%s\n'
            // var styleAndValue = [
            //   `display: list-item;
            //   list-style: square outside none;`,
            //   value.replace(/(\*|-)/, '•')
            // ]
            // state.parsed.push(...styleAndValue)
            value = value.replace(/(\*|-)/, '•')
            var arrs = something(value, style, state)
            arrs.map(arr => state.parsed.push(...arr))
            return
            break;

          // BLOCKQUOTE
          case /^> (.*)/.test(value):
            state.parsed[0] += '%c%s\n'
            var styleAndValue = [
              `border-left: 1px solid #ccc;`,
              value.replace('> ', ' ')
            ]
            state.parsed.push(...styleAndValue)
            return
            break;

          // HEADING 3
          case /^### (.*)/.test(value):
            state.parsed[0] += '%c%s\n'
            var styleAndValue = [
              `display: block;
              font-size: 1.17em;
              -webkit-margin-before: 1em;
              -webkit-margin-after: 1em;
              -webkit-margin-start: 0px;
              -webkit-margin-end: 0px;
              font-weight: bold;`,
              value.replace('### ', '')
            ]
            state.parsed.push(...styleAndValue)
            return
            break;

          // HEADING 2
          case /^## (.*)/.test(value):
            state.parsed[0] += '%c%s\n'
            var styleAndValue = [
              `font-weight: bold;
              font-size: 1.5em;
              -webkit-margin-before: 0.83em;
              -webkit-margin-after: 0.83em;
              -webkit-margin-start: 0px;
              -webkit-margin-end: 0px;`,
              value.replace('## ', '')
            ]
            state.parsed.push(...styleAndValue)
            return
            break;

          // HEADING 1
          case /^# (.*)/.test(value):
            var style =
              `font-weight: bold;
              font-size: 2em;
              -webkit-margin-before: 0.67em;
              -webkit-margin-after: 0.67em;
              -webkit-margin-start: 0px;
              -webkit-margin-end: 0px;`
            value = value.replace(/^(# )/, '')

            var arrs = something(value, style, state)
            arrs.map(arr => state.parsed.push(...arr))

            return
            break;

          case value === '':
            let newLine = '\n'
            state.parsed[0] += newLine
            return
            break;

          default:
            var inLine = parseInline(value)
            if (inLine) {
              inLine.map(line => {
                state.parsed[0] += line[0]
                line.shift()
                state.parsed.push(...line)
              })
              state.parsed[0] = state.parsed[0].trim() + '\n'
            } else {
              let trimmedValue = [
                '',
                value
              ]
              state.parsed[0] += '%c%s\n'
              state.parsed.push(...trimmedValue)
            }

        }

      }

    }
  }

  let proxy = new Proxy(state, handler)

  return proxy

}

try {
  module.exports = parseLine
} catch (e) {

}

var test = parseLine()

var docs =
`# H1

## H2

### H3

> Blockquote
> more

test

a paragraph that
wraps to next line

'*' =>
* list 1
* list 2
* list 3

'-' =>
- list 1
- list 2
- list 3

1. list 1
2. list 2
3. list 3

1) list 1
2) list 2
3) list 3

---

***

    # code block 1
    block 2
    block 3

test

'*' =>
Inline *italic* test *test*

'_' =>
Inline _italic_ test _test_

'starstar' =>
Inline **bold** test **test**

'underscoreunderscore' =>
Inline __bold__ test __test__

nothing to be done about links
[link](http://google.com)

nothing can be done about images either
![Image](http://url/a.png)

# _Italic_ test

`

docs.split('\n').map(line => {
  test.line = line
})

console.log(...test.parsed)
