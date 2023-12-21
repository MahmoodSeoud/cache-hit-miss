# cache-hit-miss

Læringsmål for projektet:
- En bruger skal have forståelse for cache i form af en simulation af en cache
- En bruger skal kunne "opføre" sig som en cache dvs. manipulere cachen korrekt givet en vilkårlig adresse
- En bruger skal have forståelsen for cache-strukturen. Givet en cache kan brugeren finde frem til sets, block size, associativity, total cache etc.


to run the project
```sh
npm i
npm run dev
```


## Pushing to production
1. Make your changes to the code
2. Fix all the warnings and Run `npm run build`. This will create a `dist` folder in the root directory
3. From here you will see a `index.html` file in the `dist` folder
```html
   <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vite + React + TS</title>
  <script type="module" crossorigin src="/assets/index-aeab2f56.js"></script>
  <link rel="stylesheet" href="/assets/index-b8a74404.css">
```
change the the `href`s and `crossorigin src` to have a relative link instead of absolute link (by changing the `/` to a `./`). Make sure that the favicon is also present in the dist folder
Here is an example:
```html
   <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="./sysMentorIcon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vite + React + TS</title>
  <script type="module" crossorigin src="./assets/index-aeab2f56.js"></script>
  <link rel="stylesheet" href="./assets/index-b8a74404.css">
```
4. Under `/dist/assets/xxx.css` run the command `:%s/\/assets/./g` to replace '/assets' with '.' (or do search and replace)
5. Push the changes and the website will run automatically. 
6. If you don't see any results right away, do a hard reload (ctrl shift R or cmd shift R)
