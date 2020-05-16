const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const session = require('express-session')
const fs = require("fs").promises

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
            arr.push(req.body.text)
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

app.delete('/:index', async function (req, res) {
    try {
        const arr = await readFile(req.session.id)
        arr.splice(req.params.index)
        await writeFile(req.session.id, arr)
        successHandler(res, {})

    } catch (e) {
        errorHandler(res, e.message)
    }
})





app.listen(8080)