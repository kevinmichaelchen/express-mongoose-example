# express-mongoose-example

Learning how to build an API with the NodeJS, Express, MongoDB, Mongoose stack.

## Getting started

### Running MongoDB in Docker
```
sudo docker run -it --rm -v $HOME/mongodata:/data/db --name mongodb -p 27017:27017 -d mongo
```

### Running the app
```
npm start
```

### Hitting the API
#### Create document
```bash
http POST localhost:3000/steps title="Woo"
```

#### Update document
```bash
http PUT localhost:3000/steps/{DOCUMENT_ID} title="New Title"
```

#### Get single document
```bash
http GET localhost:3000/steps/{DOCUMENT_ID}
```

#### Get all documents
```bash
http GET localhost:3000/steps

http GET localhost:3000/steps first=="2" after=="60244a1be3926219060bd291"
```

#### Delete document
```bash
http DELETE localhost:3000/steps/{DOCUMENT_ID}
```

## Sources
- [Converting to ES6](https://www.freecodecamp.org/news/how-to-enable-es6-and-beyond-syntax-with-node-and-express-68d3e11fe1ab/)
- [Using async/await with Express](https://zellwk.com/blog/async-await-express/)
- [Limiting results](https://kb.objectrocket.com/mongo-db/how-to-use-the-mongoose-limit-function-927)
- [ULID](https://github.com/ulid/spec), a compact, random ID generator with sorting.