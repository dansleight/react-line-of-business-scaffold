# react-line-of-business-scaffold

The intent of this project is to create a React SPA front-end with a dotnet web-api back-end with a flexible configuration to use as a scaffold for new line-of-business (admin) projects.

I use scaffold purposefully. The intent is to give the developer a canvas, not a framework. Once you have instantiated your own copy, do what you need to have it fit your needs.

## Current State

There is currently just a React application, using Vite. `npm i` followed by `npm run dev` should get it running.

Like almost all work, this is very derived. The purpose of this endeavor is not to reinvent anything, but to put together a particular set of tools that fits in certain line-of-business scenarios without looking so much like a typical line-of-business application.

## Documentation

I'll be working a bit on documentation, but not comprehensive instructions on how to be a developer.

## Choices

There are a lot of decisions I've made here that I'll work to explain. I don't think that you would use this scaffold inside of an organization without doing some licensing, for instance:

- I've included the free fontwesome libraries, however, if I were using this to produce a production, internal application, I'd license my development team to use the full version.
- I'm intending to include the free version of AG-Grid, but feel the same about that, I'd license my development team to the full version, especially if I were surfacing any significant amount of financial data.
