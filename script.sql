CREATE TABLE spots (
   spotname TEXT NOT NULL PRIMARY KEY,
   description TEXT NOT NULL,
   image BLOB,
   rating REAL,
   latitude REAL,
   longitude REAL
);
SELECT * FROM spots