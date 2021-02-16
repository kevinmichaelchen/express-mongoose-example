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
#### Append document
```bash
http POST localhost:3000/steps/add

curl -X POST localhost:3000/steps/add -d '{"data_block": {"title": "Title"}}'

echo '{ "data_block": { "title": "Title" }, "media_block": { "highlight_block": {} } }' | http localhost:3000/steps/add
```
#### Create document
```bash
http POST localhost:3000/steps title="Woo"
```

#### Update document
```bash
echo '{ "data_block": { "title": "New New Title" }, "media_block": { "highlight_block": {} } }' | http PUT localhost:3000/steps/01EYPH9FPXH0F7X8AB8292A4AB
```

#### Get single document
```bash
http GET localhost:3000/steps/01EYPH9FPXH0F7X8AB8292A4AB
```

#### Get all documents
```bash
http GET localhost:3000/steps

# Forward pagination
http GET localhost:3000/steps first=="2" after=="01EY6YXJMWSJTG5QD1D866XACY"

# Backward pagination
http GET localhost:3000/steps last=="2" before=="01EY6YXJMWSJTG5QD1D866XACY"
```

#### Delete document
```bash
http DELETE localhost:3000/steps/01EYPH9NTW4VZCJMBCSEH3RTAS
```

#### Delete all documents
```bash
http DELETE localhost:3000/steps
```

## Sources
- [Converting to ES6](https://www.freecodecamp.org/news/how-to-enable-es6-and-beyond-syntax-with-node-and-express-68d3e11fe1ab/)
- [Using async/await with Express](https://zellwk.com/blog/async-await-express/)
- [Limiting results](https://kb.objectrocket.com/mongo-db/how-to-use-the-mongoose-limit-function-927)
- [ULID](https://github.com/ulid/spec), a compact, random ID generator with sorting.