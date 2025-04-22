# react-line-of-business-scaffold

The intent of this project is to create a React SPA front-end with either a dotnet web-api back-end or a python fastapi back-end, either with a flexible configuration to use as a scaffold for new line-of-business (admin) projects.

I use scaffold purposefully. The intent is to give the developer a canvas, not a framework. Once you have instantiated your own copy, do what you need to have it fit your needs.

## Current State

Both a WebAPI/C# and a FastAPI/Python are in place, in various states of readiness. The C# probably more ready than the Python, but it's getting there.

The SPA is pretty far along, and really just lacks some polish, and perhaps more examples. I'd really like to establish a few capablities:
- Create a forms pattern that uses the generated contracts to help with generation and validation. Creating and binding forms should be really easy with this framework.
- Be able to easiliy bind collections of data to a grid. I'd like to use the free version of AG-Grid, as I believe it is well enhanced by buying licensing, especially in a line-of-bussiness scenario.

## Documentation

I'll be working a bit on documentation, but not comprehensive instructions on how to be a developer.

## Choices

There are a lot of decisions I've made here that I'll work to explain. I don't think that you would use this scaffold inside of an organization without doing some licensing, for instance:

- I've included the free fontwesome libraries, however, if I were using this to produce a production, internal application, I'd license my development team to use the full version.
- I'm intending to include the free version of AG-Grid, but feel the same about that, I'd license my development team to the full version, especially if I were surfacing any significant amount of financial data.
