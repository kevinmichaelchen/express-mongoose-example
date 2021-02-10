# express-mongoose-example

Learning how to build an API with the NodeJS, Express, MongoDB, Mongoose stack.

## Getting started

### Running MongoDB in Docker

```
sudo docker run -it --rm -v $(pwd)/mongodata:/data/db --name mongodb -p 27017:27017 -d mongo
```

### Running the app
```
npm start
```

## Sources
- [Converting to ES6](https://www.freecodecamp.org/news/how-to-enable-es6-and-beyond-syntax-with-node-and-express-68d3e11fe1ab/)