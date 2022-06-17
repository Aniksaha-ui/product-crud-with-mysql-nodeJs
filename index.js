const mysql = require("mysql");
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const { json } = require("body-parser");
const port = 4000 || "";

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
var pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "assignment",
});

app.get("/products/:qrcode", (req, res) => {
  const qrCode = req.params.qrcode;
  pool.getConnection((err, connection) => {
    if (err) {
      throw err;
      console.log(`connected id is ${connection.threadId}`);
    }

    connection.query(
      `SELECT * FROM products where qr_code=${qrCode}`,
      (err, rows) => {
        connection.release();

        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
        }
      }
    );
  });
});

//delete a product
app.delete("/products/:id", (req, res) => {
  const id = req.params.id;
  pool.getConnection((err, connection) => {
    if (err) {
      throw err;
      console.log(`connected id is ${connection.threadId}`);
    }

    connection.query(`Delete FROM products where id=${id}`, (err, rows) => {
      connection.release();

      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    });
  });
});

app.listen(port, () => console.log(`Application is running ${port}`));
