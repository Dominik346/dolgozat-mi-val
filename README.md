# Fitness backend – D csoport

A projekt a feltöltött `fitness_db.sql` fájl tényleges mezőneveit használja:
- `tipusok(id, nev)`
- `berletek(id, tipus_id, megnevezes, ar, ervenyesseg_nap, elerheto)`

## Indítás

1. Importáld a `fitness_db.sql` fájlt MySQL-be / phpMyAdminba.
2. Nyiss terminált a projekt mappájában.
3. Futtasd: `npm install`
4. Másold le a `.env.example` fájlt `.env` néven, és állítsd be az adatbázis felhasználót/jelszót.
5. Futtasd: `npm start`

A szerver alapértelmezett címe: http://localhost:3000

## Végpontok

- `GET /berletek`
- `GET /berletek/elerheto`
- `GET /berletek/kereses/:szoveg`
- `GET /tipusok/statisztika`
- `GET /berletek/dragak`

Megjegyzés: az `elerheto` végpont az SQL-ben szereplő `elerheto = 1` és `ervenyesseg_nap <= 30` feltételeket használja. Az SQL-ben nincs `diak_kedvezmeny` vagy `ervenyes_napok` mező.
