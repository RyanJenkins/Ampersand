import SQLite from 'react-native-sqlite-storage'

function errorCB(err) {
  console.log("SQL Error: " + err)
}

function successCB() {
  console.log("SQL executed fine")
}

function openCB() {
  console.log("Database OPENED")
}

SQLite.DEBUG(false);
SQLite.enablePromise(true);


const schema = [
  `CREATE TABLE IF NOT EXISTS kv_store (
    key TEXT UNIQUE NOT NULL,
    value TEXT)`,
  `CREATE TABLE IF NOT EXISTS artists (
    ampache_id NUMBER UNIQUE NOT NULL,
    name STRING NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS albums (
    ampache_id NUMBER UNIQUE NOT NULL,
    name STRING NOT NULL,
    artist_id NUMBER NOT NULL,
    year NUMBER,
    FOREIGN KEY(artist_id) REFERENCES artists(ampache_id))`,
  `CREATE TABLE IF NOT EXISTS tracks (
    ampache_id NUMBER UNIQUE NOT NULL,
    track_number NUMBER,
    name STRING NOT NULL,
    url STRING NOT NULL,
    album_id NUMBER NOT NULL,
    FOREIGN KEY(album_id) REFERENCES albums(ampache_id))`,
]

const antiSchema = [
  `DROP TABLE IF EXISTS kv_store`,
  `DROP TABLE IF EXISTS artists`,
  `DROP TABLE IF EXISTS albums`,
  `DROP TABLE IF EXISTS tracks`
]

class DBWrapper {
  constructor(db) {
    this.db = db
  }

  getSetting(key) {
    return new Promise((resolve, reject) => {
      this.db.executeSql(`SELECT value FROM kv_store WHERE key = ?`, [key])
        .then(([results]) => {
          resolve(JSON.parse(results.rows.item(0).value))
        })
    })
  }

  setSetting(key, value) {
    const args = [JSON.stringify(value), key]
    return this.db.executeSql(`UPDATE kv_store SET VALUE = ? WHERE key = ?`, args)
      .then(([result]) => {
        if (!result.rowsAffected) {
          return this.db.executeSql(`INSERT INTO kv_store (VALUE, KEY) VALUES (?, ?)`, args)
        }
      })
  }

  insert(table, row) {
    let colNames = []
    let placeHolder = []
    let values = []

    for (let key in row) {
      colNames.push(key)
      placeHolder.push('?')
      values.push(row[key])
    }

    colNames = colNames.join(', ')
    placeHolder = placeHolder.join(', ')

    const query = `INSERT INTO ${table} (${colNames}) VALUES (${placeHolder})`

    return this.executeSql(query, values)
  }

  selectOne(table, where) {
    return new Promise((resolve, reject) => {
      const clauses = []
      const args = []

      for (let key in where) {
        clauses.push(`${key} = ?`)
        args.push(where[key])
      }

      const clauseStr = clauses.join(' AND ')
      const query = `SELECT * FROM ${table} WHERE ${clauseStr}`

      this.executeSql(query, args)
        .then(([results]) => {
          if (results.rows.length !== 1)
            throw new Error(
              `Unexpected number or results: ${results.rows.length}`)

          resolve(results.rows.item(0))
        })
    })
  }

  flush() {
    return (Promise.all(antiSchema.map(sql => this.executeSql(sql)))
      .then(() => Promise.all(schema.map(sql => this.executeSql(sql))))
      .then(() => this.setSetting('instance', dummyInstance)))
  }

  executeSql(...args) { return this.db.executeSql(...args) }
}

const dummyInstance = {
  url: 'http://music.lannysport.net',
  username: 'lanny',
  password: '',
  version: '350001'
}

function readyDB(db) {
  return new Promise((resolve, reject) => {
    const wdb = new DBWrapper(db)

    Promise.all(schema.map(sql => wdb.executeSql(sql)))
      .then(() => wdb.setSetting('instance', dummyInstance))
      .then(() => {
        resolve(wdb)
      })
  })
}

const readyPromise = new Promise((resolve, reject) => {
  SQLite.openDatabase({name: 'ampersand.db', location: 'default'})
    .then(db => readyDB(db))
    .then(wdb => resolve(wdb))
})
    


export default function getConnection() {
  return readyPromise
}
