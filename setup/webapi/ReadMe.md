# Setup Scripts

These scripts help set up the back-end and clean-up the unused one.

The set-backend scripts will replace strings throughout both the back-end and front-end applications, and clean up items that are related to the unused back-end.

These scripts are of little value after you have setup your application, consider removing the `setup` directory before your first commit.

## Set Backend as Python FastAPI

```bash
pnpm i
pnpm run set-backend-fastapi
```

Follow the prompts.

## Set Backend as C# WebAPI

```bash
pnpm i
pnpm run set-backend-webapi
```

Follow the prompts.

## Set the Logo

This script allows you to change the default, goof logo to an icon from FontAwesome. Recognize this should be a placeholder, or you need to be sure that you are properly licensed to use it in this manor.

```bash
pnpm i # if you haven't already
pnpm run set-logo
```
