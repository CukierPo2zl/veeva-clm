# Vyepti/ Veeva
Simple enviroment for veeva CLM development

## What does it do?
* Watch, Rebuild, Hot reload in your browser
* SASS compilation
* Build for Veeva Vault upload
    * Zip file generation
    * Relative link conversion
* Images and gifs compression
* Shared resources

## What does it NOT do?
* Thumbnail generation (Veeva requires thumbnail image for each slide) 

## Quick start
* dev 
```sh
$ npm run dev
```

* build
```sh
$ npm run build
```

## View/Slide structure

    Slide_name
    ├───assets
    │   └───images
    ├───js
    │   └─── index.js
    ├───scss
    ├───thumb.png
    ├───full.png
    └─── index.html


