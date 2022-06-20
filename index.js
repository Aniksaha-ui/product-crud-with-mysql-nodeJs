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

app.get("/product/:qrcode", (req, res) => {
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
app.delete("/product/:id", (req, res) => {
  const id = req.params.id;
  pool.getConnection((err, connection) => {
    if (err) {
      throw err;
      console.log(`connected id is ${connection.threadId}`);
    }

    connection.query(`Delete FROM products where id=${id}`, (err, rows) => {
      connection.release();

      if (!err) {
        if (rows.affectedRows == 1) {
          res.send({ message: "Product deleted succesfully" });
        } else {
          res.send({ message: "Product not found" });
        }
      } else {
        console.log(err);
      }
    });
  });
});

//add a new product

app.post("/product", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      throw err;
      console.log(`connected id is ${connection.threadId}`);
    }
    const params = req.body;
    connection.query(`INSERT INTO products SET ?`, params, (err, rows) => {
      connection.release();

      if (!err) {
        res.send(`New Product inserted`);
      } else {
        console.log(err);
      }
    });
  });
});

//update a product
app.patch("/product/:id", (req, res) => {
  const id = req.params.id;

  pool.getConnection((err, connection) => {
    if (err) {
      throw err;
      console.log(`connected id is ${connection.threadId}`);
    }
    const request = req.body;
    const { title, description, selling_price, cost_price, qr_code } = request;

    connection.query(
      `UPDATE products SET title = ? , description = ? ,selling_price= ?, cost_price= ?,qr_code = ?  WHERE  id=${id}`,
      [title, description, selling_price, cost_price, qr_code],
      (err, rows) => {
        connection.release();

        if (!err) {
          res.send(`Product updated`);
        } else {
          console.log(err);
        }
      }
    );
  });
});

//invoice
app.get("/invoice/:orderId", (req, res) => {
  const invoiceId = req.params.orderId;
  console.log(invoiceId);
  pool.getConnection((err, connection) => {
    if (err) {
      throw err;
      console.log(`connected id is ${connection.threadId}`);
    }

    connection.query(
      `SELECT title,qr_code,selling_price,quantity FROM products JOIN cart WHERE products.id = cart.product_id AND OrderNumber=${invoiceId};
      `,
      (err, productRows) => {
        connection.release();
        if (!err) {
          let totalAmount = 0;

          productRows.map(
            (product) =>
              (totalAmount =
                totalAmount + product.selling_price * product.quantity)
          );
          console.log(totalAmount);
          const data = {
            orderedProduct: productRows,
            totalAmount: totalAmount,
          };

          res.send(data);
        } else {
          console.log(err);
        }
      }
    );
  });
});

//profit
app.get("/profit/:date", (req, res) => {
  const date = req.params.date;
  console.log(date);
  pool.getConnection((err, connection) => {
    if (err) {
      throw err;
      console.log(`connected id is ${connection.threadId}`);
    }

    connection.query(
      `SELECT sum(selling_price*quantity - cost_price*quantity) as profit FROM cart join products WHERE cart.product_id = products.id AND date="${date}"`,
      (err, rows) => {
        connection.release();

        if (!err) {
          // console.log(rows);
          res.send(rows);
        } else {
          console.log(err);
        }
      }
    );
  });
});

app.listen(port, () => console.log(`Application is running ${port}`));
