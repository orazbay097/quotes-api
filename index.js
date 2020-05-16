const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const session = require('express-session')
const fs = require("fs").promises

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", !req.headers.origin ? "*" : req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Version, Authorization");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    next();
});

app.use(express.json({ limit: "50mb" }))
app.use(
    express.urlencoded({
        limit: "50mb",
        extended: true,
    })
);
app.use(cookieParser())
app.use(session({
    secret: "Qwerty",
    resave: false,
    saveUninitialized: true
}));


const successHandler = (res, data) => { res.status(200).send({ success: true, data }) }
const errorHandler = (res, error = "Ошибка") => { res.status(200).send({ success: false, error }) }

const readFile = async (id) => {
    try {
        return JSON.parse(await fs.readFile(`files/${id}.json`, "utf8"));
    } catch (e) {
        return [];
    }
}

const writeFile = async (id, json) => {
    await fs.writeFile(`files/${id}.json`, JSON.stringify(json))
}


app.get('/', async function (req, res) {
    try {
        successHandler(res, await readFile(req.session.id))
    } catch (e) {
        errorHandler(res, e.message)
    }

})

app.put('/', async function (req, res) {
    try {
        if (!req.body.text) throw Error("Нет цитаты")
        const arr = await readFile(req.session.id)
        if (arr.length < 10) {
            arr.push(req.body)
            await writeFile(req.session.id, arr)
            successHandler(res, {})
        } else {
            errorHandler(res, "Макс. 10 цитат")
        }

    }
    catch (e) {
        errorHandler(res, e.message)
    }
})

app.delete('/:id', async function (req, res) {
    try {
        const arr = await readFile(req.session.id)
        arr.splice(arr.findIndex(i => i.id == req.params.id),1)
        await writeFile(req.session.id, arr)
        successHandler(res, {})

    } catch (e) {
        errorHandler(res, e.message)
    }
})


app.listen(8080)