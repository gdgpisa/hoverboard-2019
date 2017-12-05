# GDG DevFest Pisa 2017 Website 🌎

 [![License](https://img.shields.io/badge/license-MIT%20License-brightgreen.svg)](https://opensource.org/licenses/MIT) [![Twitter](https://img.shields.io/badge/Twitter-@gdgPisa-blue.svg?style=flat)](http://twitter.com/gdgPisa)

<p align="center">
  <img src="https://i.imgur.com/yoobq6G.png" alt="readme screenshot"/>
</p>

:zap: [Live Website](https://devfest.gdgpisa.it/)

### Setup
:book: [Full documentation](/docs/).

Install Node.JS dependencies with:
```
npm install
```

Then start the development server with
```
npm run serve
```

This command serves the app at `http://localhost:3000` and provides basic URL routing for the app:

:book: Read more in [setup docs](/docs/tutorials/set-up.md).

### Build

This command performs HTML, CSS, and JS minification on the application
dependencies, and generates a service-worker.js file with code to pre-cache the
dependencies based on the entrypoint and fragments specified in `polymer.json`.
The minified files are output to the `build`.

```
npm run build
```

:book: Read more in [deploy docs](/docs/tutorials/deploy.md).   

### Contributing

Project Hoverboard is still under development, and it is open for contributions.
Feel free to send PR. If you have any questions, feel free to contact
[Oleh Zasadnyy](https://plus.google.com/+OlehZasadnyy).

:book: Read complete [contributing guide](CONTRIBUTING.md).


### Acknowledgment

Website based on [Project Hoverboard](https://github.com/gdg-x/hoverboard), template brought by [Oleh Zasadnyy](https://plus.google.com/+OlehZasadnyy)
from [GDG Lviv](http://lviv.gdg.org.ua/).

> *Do you :heart: it?* Show your support - please, [star](https://github.com/gdg-x/hoverboard) the project.


### License

Project is published under the [MIT license](https://github.com/gdg-x/hoverboard/blob/master/LICENSE.md).  
Feel free to clone and modify repo as you want, but don't forget to add reference to authors :)
