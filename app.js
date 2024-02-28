const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')

dbPath = path.join(__dirname, 'todoApplication.db')
const app = express()

app.use(express.json())
let db = null

const initilizeServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started')
    })
  } catch (error) {
    console.log('DB Error')
    process.exit(1)
  }
}
initilizeServerAndDB()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

//API : 1

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})

//API : 2

app.get('/todos/:todoId/', async (req, res) => {
  const {todoId} = req.params
  const getStatusIdQuery = `SELECT * 
                            FROM todo
                              WHERE 
                            id = ${todoId}`
  const statusDetails =await db.get(getStatusIdQuery)
  res.send(statusDetails)
})

//API : 3
app.post('/todos/', async (req, res) => {
  const {id, todo, priority, status} = req.body
  const insertTable = `INSERT INTO todo (id, todo, priority, status) 
                        VALUES (${id},'${todo}', '${priority}','${status}');`
  await db.run(insertTable)
  res.send('Todo Successfully Added')
})

//API : 4
app.put('/todos/:todoId/', async (req, res) => {
  const {todoId} = req.params
  let updateColumn = ''
  const reqBody = req.body

  switch (true) {
    case reqBody.status !== undefined:
      updateColumn = 'Status'
      break
    case reqBody.priority !== undefined:
      updateColumn = 'Priority'
      break
    case reqBody.todo !== undefined:
      updateColumn = 'Todo'
      break
  }
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`
  const todoQuery = await db.get(getTodoQuery)

  const {
    todo = todoQuery.todo,
    priority = todoQuery.priority,
    status = todoQuery.status,
  } = req.body

  const updateTodoQuery = `UPDATE todo 
    SET
      todo = '${todo}',
      priority = '${priority}',
      status = '${status}'
    WHERE 
      id = ${todoId}`
  await db.run(updateTodoQuery)
  res.send(`${updateColumn} Updated`)
})
//API : 5
app.delete('/todos/:todoId/', async (req, res) => {
  const {todoId} = req.params
  const getDeleteQuery = `DELETE FROM todo WHERE id = ${todoId}`

  await db.run(getDeleteQuery)
  res.send('Todo Deleted')
})
module.exports = app
