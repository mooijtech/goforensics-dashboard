<h1 align="center">
  <br>
  <a href="https://github.com/mooijtech/goforensics-dashboard"><img src="https://i.imgur.com/kd7fwOf.png" alt="Go Forensics Frontend" width="180"></a>
  <br>
  Go Forensics Frontend
  <br>
</h1>

<h4 align="center">Open source forensic software to analyze digital evidence to be presented in court.</h4>

---

NextJS (React) dashboard for communicating with the [Go Forensics API](https://github.com/mooijtech/goforensics-api).

### Installation

[Yarn](https://yarnpkg.com/) is required to install dependencies.

```bash
$ npm install --global yarn
```

```bash
# Download or clone this repository.
$ git clone https://github.com/mooijtech/goforensics-dashboard

# Change directory.
$ cd goforensics-dashboard

# Make sure you are using Node v16:
# https://github.com/nvm-sh/nvm
$ nvm install 16

# Install dependencies.
$ yarn install

# Set our environment variables
$ export GO_FORENSICS_WEBSITE_URL=http://localhost:3000
$ export GO_FORENSICS_API_URL=http://localhost:1337
$ export TUS_URL=http://localhost:1080
$ export ORY_SDK_URL=http://localhost:4433

# Start the server.
$ yarn run dev
```

### Libraries

- [react-dropdown-tree-select](https://github.com/dowjones/react-dropdown-tree-select)
- [react-albus](https://github.com/americanexpress/react-albus)
- [tailwind-datepicker](https://github.com/themesberg/tailwind-datepicker)
- [react-sigma](https://github.com/sim51/react-sigma) 
    - [sigma](https://github.com/jacomyal/sigma.js/)
    - [graphology](https://github.com/graphology/graphology)
    - [tslib](https://github.com/microsoft/tslib)
- [next-images](https://github.com/twopluszero/next-images)

### Images

- [Line Awesome](https://icons8.com/line-awesome)
- [Office Dave](https://growwwkit.com/illustrations/office-dave/)
