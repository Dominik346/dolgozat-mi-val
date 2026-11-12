const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
app.use(express.json());

// Kapcsolat a feltöltött fitness_db.sql adatbázisához
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fitness_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 1. GET /berletek
// Minden bérlet, a típus nevével együtt, ár szerint növekvően.
app.get("/berletek", async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        b.id,
        b.megnevezes,
        b.ar,
        b.ervenyesseg_nap,
        b.elerheto,
        t.nev AS tipus_nev
      FROM berletek AS b
      INNER JOIN tipusok AS t ON b.tipus_id = t.id
      ORDER BY b.ar ASC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// 2. GET /berletek/elerheto
// Az elérhető, legfeljebb 30 napig érvényes tételek.
app.get("/berletek/elerheto", async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        tipus_id,
        megnevezes,
        ar,
        ervenyesseg_nap,
        elerheto
      FROM berletek
      WHERE elerheto = 1
        AND ervenyesseg_nap <= 30
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// 3. GET /berletek/kereses/:szoveg
// Részletkeresés a megnevezésben.
app.get("/berletek/kereses/:szoveg", async (req, res, next) => {
  try {
    const keresettSzoveg = `%${req.params.szoveg}%`;
    const [rows] = await pool.execute(`
      SELECT
        id,
        tipus_id,
        megnevezes,
        ar,
        ervenyesseg_nap,
        elerheto
      FROM berletek
      WHERE megnevezes LIKE ?
    `, [keresettSzoveg]);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// 4. GET /tipusok/statisztika
// Típusonkénti darabszám és átlagár (1 tizedesre kerekítve).
app.get("/tipusok/statisztika", async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.nev AS tipus_nev,
        COUNT(b.id) AS berletek_szama,
        ROUND(AVG(b.ar), 1) AS atlagos_ar
      FROM tipusok AS t
      LEFT JOIN berletek AS b ON b.tipus_id = t.id
      GROUP BY t.id, t.nev
      ORDER BY t.id
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// 5. GET /berletek/dragak
// 20 000 Ft feletti tételek, érvényesség szerint csökkenően.
app.get("/berletek/dragak", async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        megnevezes,
        ar,
        ervenyesseg_nap
      FROM berletek
      WHERE ar > 20000
      ORDER BY ervenyesseg_nap DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// Nem létező útvonal esetén is JSON válasz.
app.use((req, res) => {
  res.status(404).json({ hiba: "Nem található végpont." });
});

// Központi hibakezelő: a szerver nem áll le, a válasz JSON.
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ hiba: err.message || "Szerverhiba történt." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`A szerver fut: http://localhost:${PORT}`);
});
